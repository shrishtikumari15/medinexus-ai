# MediNexus AI — Phase 0: Data Audit, Leakage Analysis & Complete Architecture

**Prepared for:** 13-Credit MCA Capstone
**Status:** Planning document only. No application code has been written yet, per your instruction.
**Datasets used:** Only the 8 files you uploaded. Nothing was fabricated or assumed.

---

## ⚠️ CRITICAL FINDINGS BEFORE WE GO FURTHER

Three things in the real data change what's realistic to promise in your report. I'm flagging them now so your capstone doesn't overclaim later.

1. **The clinical data is the MIMIC-IV-ED "demo" subset, not the full dataset.**
   `edstays.csv` has only **222 ED stays** belonging to just **64 unique patients** (158 of the 222 stays are repeat visits by the same 64 people). Full MIMIC-IV-ED has ~425,000 stays. This is a small, de-identified demo extract. Your report must state this explicitly — it directly affects how much you can claim about model generalization.

2. **No `age` column exists anywhere in the clinical files.** The prompt's example feature list mentioned age, but it is simply not present in `edstays.csv`, `triage.csv`, or any other file. We will build the model without it and document the omission — we will not invent an age field.

3. **Triage `acuity` (your candidate target) is heavily imbalanced,** and **Emergency_Services / Hospital_Category / Hospital_Care_Type in the hospital directory are ~93–95% blank or a placeholder `"0"`.** Both require documented mitigation (below), not silent workarounds.

Everything below is built around these realities.

---

## PART A — COMPLETE DATA AUDIT

### A.1 Clinical dataset (MIMIC-IV-ED demo, 6 files)

| File | Rows | Cols | Exact columns | Unique key | Duplicates |
|---|---|---|---|---|---|
| `edstays.csv` | 222 | 9 | subject_id, hadm_id, stay_id, intime, outtime, gender, race, arrival_transport, disposition | `stay_id` (unique, 222/222) | 0 |
| `triage.csv` | 222 | 11 | subject_id, stay_id, temperature, heartrate, resprate, o2sat, sbp, dbp, pain, acuity, chiefcomplaint | `stay_id` (unique, 1:1 with edstays) | 0 |
| `diagnosis.csv` | 545 | 6 | subject_id, stay_id, seq_num, icd_code, icd_version, icd_title | `stay_id` repeats (221 distinct) | 0 |
| `medrecon.csv` | 2,764 | 9 | subject_id, stay_id, charttime, name, gsn, ndc, etc_rn, etccode, etcdescription | `stay_id` repeats (181 distinct) | 0 |
| `pyxis.csv` | 1,082 | 7 | subject_id, stay_id, charttime, med_rn, name, gsn_rn, gsn | `stay_id` repeats (176 distinct) | 0 |
| `vitalsign.csv` | 1,038 | 11 | subject_id, stay_id, charttime, temperature, heartrate, resprate, o2sat, sbp, dbp, rhythm, pain | `stay_id` repeats (206 distinct) | 0 |

**Missing values of note:**
- `edstays.hadm_id`: 50 missing (these are the ED-only visits that were never formally admitted — expected, not an error).
- `triage.csv`: acuity missing in 15/222 rows; vitals (temp/HR/RR/O2/SBP/DBP) missing in 21–26 rows each; pain missing in 21.
- `vitalsign.csv`: temperature missing in 459/1038, rhythm missing in 1005/1038 (rhythm is rarely recorded — expected for a general vitals table, not just cardiac cases).

**Patient-level structure (important):** all 222 `stay_id` values in the 5 child tables are a strict subset of `edstays.stay_id` — every join is safe and referentially clean. But because 64 patients account for 222 stays, **any train/test split must be done by `subject_id`, not by `stay_id`** — otherwise the same patient's data leaks across the split.

**Target candidate — `triage.acuity` distribution:**
| Acuity | Count |
|---|---|
| 1 (most urgent) | 18 |
| 2 | 97 |
| 3 | 90 |
| 4 | 2 |
| 5 | 0 |
| missing | 15 |

This is the single most important data-quality fact for your ML chapter — see Part D.

### A.2 Hospital Master Data — `hospital_directory.csv`

- **30,273 rows, 48 columns.** `Sr_No` is a clean unique primary key (1–32,048, no duplicates).
- **Placeholder pattern:** most optional columns use the string `"0"` to mean "not provided" rather than a true blank. This affects `Hospital_Category` (28,233/30,273 = 93% are `"0"`), `Hospital_Care_Type` (28,328 = 94% are `"0"`), and especially **`Emergency_Services`, which is `"0"` or blank for 30,271 of 30,273 rows** — only 2 rows anywhere in the file contain a real value (`"24 Hours"`, `"Emergency Services 24 Hours"`). **This means Emergency_Services as given is not usable as a per-hospital filter/feature at any meaningful scale.** We will derive an `emergency_flag` instead from keyword search inside `Facilities`/`Specialties` text (e.g., "emergency", "casualty", "24 hours"), clearly documented as a **derived proxy, not authoritative data**.
- **`Location_Coordinates`**: missing in 19,322/30,273 rows (64%). Present rows are `"lat, lon"` strings that parse cleanly. This is exactly where your Geoapify key becomes useful — see Part F/H.
- **`Specialties` / `Facilities`**: free-text fields, comma- **and newline-separated inconsistently**, with embedded line breaks inside single cells. Real normalization work is required (tokenize on `,` and `\n`, strip whitespace, dedupe, lowercase for matching, keep original casing for display).
- **`Total_Num_Beds`** loads as text because of the `"0"` sentinel mixed with real numeric strings (e.g. "12", "2000"); needs numeric coercion with `"0"` treated as **unknown**, not zero-bed capacity, unless cross-checked.
- 211 rows share the same `Hospital_Name` + `Location` (likely duplicate listings/branches in the source registry — will be flagged, not silently dropped).
- 1,599 rows have a non-placeholder `Website`.

### A.3 Synthetic Operational Dataset — `operational_dataset.csv`

- **10,000 rows, 13 columns**, **zero missing values**, columns exactly match the prompt's description.
- **Only 5 distinct `hospital_id` values** (H001–H005) — this is a small simulated hospital roster, cycled across `day_of_week` (0–6) × `hour` (0–23) combinations, not 10,000 distinct hospitals. This is fine for a *simulation/training* dataset but must be labeled clearly in the report as **"Synthetic Operational Dataset — 5 simulated hospitals"**, exactly as your instructions require.
- Ranges: `waiting_time_minutes` 2.0–157.3 (mean 24.4), `bed_occupancy` 0.35–0.98, `doctor_utilization` 0.25–0.99 — all realistic, no obvious outlier corruption.

---

## PART B — HOW THE 6 CLINICAL FILES RELATE

```
                         edstays.csv  (222 rows — 1 row per ED encounter)
                         stay_id (PK) ── subject_id, hadm_id, intime, outtime,
                                          gender, race, arrival_transport, disposition
                              │
      ┌────────────┬──────────┼──────────┬─────────────┐
      │            │          │          │             │
 triage.csv   diagnosis.csv medrecon.csv pyxis.csv  vitalsign.csv
 (1:1 with    (1:many,     (1:many,     (1:many,    (1:many,
  edstays,     221 stays)   181 stays)   176 stays)  206 stays)
  222 rows)
```

- `edstays` is the parent/fact table for one ED visit.
- `triage` is a **1:1 extension of edstays** — the vitals/complaint captured at the moment the patient walked in. This is the earliest clinical snapshot and the safe starting point for any "risk at arrival" model.
- `diagnosis`, `medrecon`, `pyxis`, `vitalsign` are **1:many child tables**, each timestamped independently, joined back to `edstays`/`triage` only via `stay_id` (and `subject_id` for patient-level grouping).
- We measured actual timestamps against `intime`: `medrecon` entries occur **8–866 minutes after arrival** (median 79 min); `vitalsign` entries occur **-17 to 4,343 minutes after arrival** (median 203 min, and only the very first reading per stay is close to `intime`). This confirms these are workup-in-progress records, **not** available at the moment of triage.

---

## PART C — DATA PREPROCESSING PLAN (3 separate ETL pipelines, as required)

### C.1 Hospital ETL (`hospital_directory.csv` → `hospitals_clean`)
1. Replace sentinel `"0"` / blank with real `NaN` across all optional columns.
2. Parse `Location_Coordinates` into `latitude`/`longitude` floats; where missing, queue for **Geoapify forward-geocoding** using `Address_Original_First_Line` + `Town`/`District`/`State`/`Pincode` (batched, cached to avoid repeat API calls, rate-limited).
3. Tokenize `Specialties` and `Facilities` into normalized arrays (split on `,`/`\n`, trim, de-duplicate, lowercase key + display label).
4. Derive `emergency_flag` (boolean) from keyword match in Facilities/Specialties text, with the 2 genuine `Emergency_Services` values honored directly where present. Document this as a derived proxy.
5. Coerce `Total_Num_Beds`, `Number_Doctor` to numeric with `"0"`/blank → `NaN` (unknown), not literal zero.
6. Flag the 211 duplicate Name+Location rows (keep, do not silently delete — surfaced in admin hospital-management screen for manual review).
7. Output: `data/processed/hospital/hospitals_clean.csv` (original untouched).

### C.2 Clinical ETL (6 MIMIC files → `clinical_model_ready.csv`)
1. Join `triage` → `edstays` on `stay_id` (1:1, safe).
2. Attach `gender`, `race`, `arrival_transport` from `edstays` (all available at intime).
3. **Do NOT join** `diagnosis`, `medrecon`, `pyxis`, or later `vitalsign` readings into the feature set for the risk-prediction model — timestamp analysis proved these post-date the triage decision (Part D).
4. Handle missing vitals (median/KNN imputation, with a `was_imputed` flag per column for transparency).
5. Encode `chiefcomplaint` (free text) via a bounded categorical/keyword-bucket approach (e.g. top-N complaint groups + "other"), not raw one-hot of every unique string (222 rows can't support hundreds of dummy columns).
6. Build the acuity → risk-class mapping **only after Part D's imbalance discussion is applied**.
7. Split by `subject_id` (not `stay_id`) into train/test to avoid patient leakage.
8. Output: `data/processed/clinical/clinical_model_ready.csv`.

### C.3 Operational ETL (`operational_dataset.csv` → `operational_model_ready.csv`)
1. Confirm/label as synthetic; no missing values found, so this stage is mostly type-checking and light outlier review (e.g. verify `bed_occupancy`, utilizations stay in [0,1]).
2. One-hot or cyclical-encode `day_of_week`/`hour` for XGBoost (tree models handle raw integers fine too — we'll compare).
3. Output: `data/processed/operational/operational_model_ready.csv`.

---

## PART D — DATA LEAKAGE ANALYSIS

**Prediction point for clinical risk model = the moment of ED triage (`edstays.intime`).**

| Source | Timing vs. intime | Verdict |
|---|---|---|
| `triage.csv` (vitals, pain, chief complaint) | Captured at arrival | ✅ Safe — use as features |
| `edstays` (gender, race, arrival_transport) | Known at arrival | ✅ Safe — use as features |
| `edstays.disposition` (admitted/home/etc.) | Known only at end of visit | ❌ Leakage — outcome, never a feature |
| `diagnosis.csv` | Finalized during/after workup | ❌ Leakage — diagnosis often *follows from* triage severity |
| `medrecon.csv` | Measured 8–866 min after intime (median 79) | ❌ Leakage for a triage-time model |
| `pyxis.csv` | Medication administered during the stay | ❌ Leakage — administration implies a clinical decision already made |
| `vitalsign.csv` (2nd+ readings) | Median 203 min after intime, up to 4,343 min | ❌ Leakage — later vitals reflect care already given |

**Documented exclusions:** `subject_id`, `stay_id`, `hadm_id`, `intime`/`outtime`, `disposition` are excluded from the feature set (identifiers/outcomes). This becomes `DATA_LEAKAGE.md` in `ml-service/`.

**Class-imbalance finding (must be handled honestly):** Applying the prompt's suggested mapping (1–2→HIGH, 3→MEDIUM, 4–5→LOW) on the *actual* data gives **HIGH=115, MEDIUM=90, LOW=2**. A 2-sample class cannot be meaningfully evaluated (no valid train/test split possible for it). Recommendation, to be stated plainly in the report:

- **Primary model target (defensible):** binary — `HIGH-URGENCY` (acuity 1–2, n=115) vs `LOWER-URGENCY` (acuity 3–4, n=92); 15 rows with missing acuity are dropped from supervised training and reported separately.
- **Secondary/exploratory target:** the original 3-class LOW/MEDIUM/HIGH mapping, presented with an explicit caveat that the LOW class has only 2 support samples and its per-class metrics are not statistically meaningful — shown for completeness, not as a claimed capability.

This is exactly the kind of honest limitation your rubric (Part 38, "academic honesty") wants documented rather than hidden.

---

## PART E — TRACEABILITY MATRIX

| Objective | Dataset | Feature(s) | Algorithm | Backend API | Frontend Page | Metric | Output |
|---|---|---|---|---|---|---|---|
| Clinical urgency prediction | Clinical (triage+edstays) | vitals, pain, chief-complaint bucket, gender, race, arrival_transport | Random Forest, LightGBM | `POST /predict-risk` | Patient Assessment → Risk Result | Accuracy, Precision/Recall/F1, confusion matrix, HIGH-class recall | LOW / HIGH (primary), LOW/MED/HIGH (secondary, caveated) |
| Required specialty identification | Clinical (chiefcomplaint) + rule table | complaint keywords, diagnosis-title vocabulary (used only to *design* the rule table offline, not as a live feature) | Rule-based classifier (explainable), hybrid with risk-model output | `POST /predict-risk` (bundled) or `POST /identify-specialty` | Risk Result | Specialty-match accuracy vs. manually labeled sample | Required Specialty tag(s) |
| Waiting-time prediction | Operational (synthetic, 5 hospitals) | patient_arrivals, doctors_available, beds_available, total_beds, bed_occupancy, queue_length, doctor_utilization, diagnostic_utilization, hospital_load, hour, day_of_week | XGBoost Regressor (RandomForestRegressor fallback) | `POST /api/v1/predict/waiting-time` | Prediction API and admin model metrics | MAE, RMSE, R² | Predicted waiting time (minutes) |
| Hospital discovery/search | Hospital directory | Specialties, Facilities, State/District/Pincode, Total_Num_Beds, Number_Doctor, derived emergency_flag, lat/lon | Filter/query logic (no ML) | `GET /hospitals`, `GET /hospitals/:id` | Hospital Search, Hospital Details | Search relevance (manual QA) | Filtered hospital list |
| Hospital ranking/recommendation | Hospital directory + risk output + waiting-time output | specialty match %, facility match %, emergency_flag, resource suitability, waiting score, location distance (Geoapify) | Weighted explainable scoring engine (Part 13 formula) | `POST /recommend` | Recommendation Results, Explanation | Top-K relevance, score consistency | Ranked hospital list + score breakdown |
| What-if resource simulation | Operational (synthetic) | arrival rate, doctors, beds, service rate | Queueing theory (M/M/c) + discrete-event simulation | `POST /simulate` | What-if Simulation (admin) | Baseline vs scenario deltas | Queue length, waiting time, utilization, load |
| Doctor verification | App-generated (users/doctors collections) | uploaded documents, profile fields | Rule/manual workflow (+ optional OCR assist, not authenticity proof) | `POST /doctors/:id/verify` | Doctor Verification (admin) | Verification turnaround (ops metric) | Approved/Rejected status |
| Location/geocoding | Hospital directory (missing coords) + Geoapify API | Address_Original_First_Line, Town, District, State, Pincode | Geoapify forward geocoding | Internal service (`GeocodingService`, called from Hospital ETL and live "distance from patient" queries) | Hospital Search (map view), Hospital Details | Geocode success rate | lat/lon for distance scoring |

---

## PART F — SYSTEM ARCHITECTURE

```
                        ┌───────────────────────────┐
                        │     React Frontend        │
                        │  (Tailwind, Recharts)     │
                        └─────────────┬─────────────┘
                                      │ REST/JWT
                        ┌─────────────▼─────────────┐
                        │   Node.js / Express API    │
                        │  Auth · RBAC · Validation  │
                        └───────┬─────────────┬──────┘
                                │             │
                     ┌──────────▼───┐   ┌─────▼─────────────┐
                     │  MongoDB      │   │ Python FastAPI ML  │
                     │ users/doctors │   │  Service            │
                     │ hospitals     │   │  - Random Forest    │
                     │ assessments   │   │  - LightGBM         │
                     │ recommendations│  │  - XGBoost          │
                     │ simulations   │   │  - Queueing/DES Sim │
                     │ model_metrics │   └─────────────────────┘
                     └───────────────┘
                                │
                     ┌──────────▼───────────────┐
                     │ Geoapify Geocoding API     │
                     │ (called server-side only;  │
                     │  key read from backend .env)│
                     └───────────────────────────┘
```

**Recommendation Engine** lives in the Node.js layer (or a thin Node service), combining: Hospital data (Mongo) + Risk/Specialty output (FastAPI) + Waiting-time output (FastAPI) + Location distance (Geoapify-derived lat/lon) → weighted score → ranked list.

### Geoapify integration note (as you requested)
- `GEOAPIFY_API_KEY` will live **only** in `backend/.env` (git-ignored), loaded via `process.env.GEOAPIFY_API_KEY` in a single `GeocodingService` module — never in frontend code, never committed, never hard-coded.
- **Since the key was pasted into this chat in plaintext, treat it as exposed** — I'd recommend rotating/regenerating it in your Geoapify dashboard before go-live, even though it's a free-tier key. This is a standard precaution, not a reflection of anything wrong with what you did.
- Usage: (1) one-time batch geocoding pass over the ~19,322 hospitals missing coordinates during Hospital ETL, cached to Mongo so we never re-call the API for the same address; (2) optional on-demand geocoding of the patient's entered location string at assessment time, for the Location Score component.

---

## PART G — DATABASE DESIGN (MongoDB)

```js
// users
{ _id, name, email, passwordHash, role: "user", createdAt }

// doctors
{ _id, userId, name, specialization, qualification, experience,
  hospitalAffiliation, documents: [{url, type, uploadedAt}],
  verificationStatus: "pending"|"approved"|"rejected",
  verifiedBy, verifiedAt }

// hospitals  (derived from hospital_directory.csv after ETL)
{ _id, sourceRowId /* Sr_No */, name, address, state, district, pincode,
  location: { type: "Point", coordinates: [lon, lat] }, // geo-indexed
  specialties: [String], facilities: [String],
  emergencyFlag: Boolean, emergencyFlagSource: "raw"|"derived",
  totalBeds: Number|null, numberDoctors: Number|null,
  category, careType, accreditation, website,
  operationalHospitalId: String|null // admin-confirmed unique mapping to an H001-H005 CSV ID
}

// assessments
{ _id, userId, clinicalInputs: {vitals, pain, chiefComplaint, ...},
  riskPrediction: {label, probaHigh, modelVersion},
  requiredSpecialties: [String], requiredResources: [String],
  locationInput: {raw, lat, lon}, createdAt }

// recommendations
{ _id, assessmentId, hospitalRankings: [
    { hospitalId, score, breakdown: {specialty, facility, emergency,
      resource, waitingTime, location}, expectedWaitMinutes,
      reasons: [String] } ],
  createdAt }

// simulations
{ _id, adminId, baseline: {arrivalRate, doctors, beds, serviceRate},
  scenario: {...same shape}, results: {baseline: {...}, scenario: {...}},
  createdAt }

// model_metrics
{ _id, modelName, modelVersion, metrics: {...}, features: [String],
  trainedAt, datasetSize, datasetDescription }
```

Indexes: `hospitals.location` (2dsphere), `hospitals.specialties`, `hospitals.state/district`, `users.email` (unique), `doctors.verificationStatus`.

---

## PART H — API DESIGN (high level; full contracts written phase-by-phase)

**Node/Express (`/api/v1/...`)**
- `POST /auth/register`, `POST /auth/login` (user/doctor/admin, JWT issued)
- `GET /hospitals` (filters: city/state/district/specialty/facility/emergency/beds/accreditation), `GET /hospitals/:id`
- `POST /assessments` → triggers ML calls → `POST /recommendations`
- `GET /recommendations/:id`, `GET /users/:id/recommendation-history`
- `POST /doctors`, `POST /doctors/:id/documents`, `GET/PATCH /admin/doctors/:id/verify` (admin-only)
- `POST /admin/simulate`, `GET /admin/analytics`, `GET /admin/model-metrics` (admin-only)

**Python FastAPI (`/ml/...`, called only by the Node backend, never directly by the frontend)**
- `POST /predict-risk` → {label, probabilities, modelVersion}
- `POST /api/v1/predict/waiting-time` → {predicted_waiting_time_minutes}
- `GET /api/v1/hospitals/:id/operations` → mapped CSV estimate or explicit unavailable response
- `GET /api/v1/admin/waiting-time-metrics` → admin-only held-out MAE, RMSE, and R²
- `POST /simulate` → {baselineResults, scenarioResults}
- `GET /model-metrics`

All admin/doctor-role endpoints protected by RBAC middleware; all inputs validated (e.g. `express-validator`/`zod`), consistent error envelope `{ success, error, details }`.

---

## PART I — ML ARCHITECTURE: what each model does and why

- **Random Forest** — ensemble of decorrelated decision trees, majority vote. Chosen as the **interpretable baseline**: gives clean feature importances, robust to the small/noisy 222-row dataset, easy to explain in your viva.
- **LightGBM** — gradient-boosted trees built leaf-wise; typically stronger on structured/tabular data than RF when there's enough signal, but can overfit small data faster. We will compare both honestly (Part 9) rather than assume LightGBM wins — with only ~200 usable rows, RF may well outperform it, and that's a legitimate, reportable finding, not a failure.
- **XGBoost (Regressor)** — gradient-boosted trees for continuous `waiting_time_minutes` target on the 10,000-row synthetic operational data, which is a much better-suited size/shape for boosting.
- **Queueing theory / discrete-event simulation** — a separate, non-ML component. XGBoost predicts wait times *from historical patterns*; the simulator instead *computes* expected queue behavior from first-principles (M/M/c-style) when the admin hypothesizes a scenario that never occurred in the data (e.g., "what if we had only 3 doctors instead of 8"). This distinction will be stated explicitly in the UI and report, exactly as your prompt requires.

---

## PART J — RECOMMENDATION ENGINE (scoring/ranking logic)

```
Score = 0.30·SpecialtyMatch + 0.20·FacilityMatch + 0.15·EmergencyCapability
      + 0.15·ResourceSuitability + 0.10·WaitingTimeScore + 0.10·LocationScore
```
- **SpecialtyMatch**: overlap between required specialty (from risk/rule engine) and the hospital's normalized `specialties` array → 0–100.
- **FacilityMatch**: overlap between required resources and normalized `facilities` array.
- **EmergencyCapability**: `emergencyFlag` (raw where the 2 genuine records exist, else derived-and-labeled) → 0 or 100 (documented as coarse due to source data limits).
- **ResourceSuitability**: normalized function of `Total_Num_Beds`/`Number_Doctor` where known; `null` (unknown capacity) handled as a mid-scale default with a "capacity unknown" explanation flag, never silently treated as zero.
- **WaitingTimeScore**: inverse-scaled XGBoost prediction (lower predicted wait → higher score), only computed for hospitals mapped to the 5 simulated `operational` IDs; for the other ~30,000 hospitals with no operational data, this component is explicitly marked "not available" and the weight is redistributed proportionally rather than silently zeroed — documented as a real prototype limitation (see Part Q).
- **LocationScore**: inverse-distance function using Geoapify-resolved coordinates vs. patient's entered location.

Weights are **configurable** (stored in `model_metrics`-adjacent config, not hard-coded), and a sensitivity-analysis notebook will show how rankings shift under alternate weightings — satisfying Part 13's explicit requirement.

---

## PART K — WHAT-IF SIMULATION DESIGN

- **Queueing theory model:** M/M/c approximation — arrival rate (λ), number of servers/doctors (c), service rate (μ) → utilization ρ, expected queue length (Lq), expected wait (Wq) via standard Erlang-C formulas.
- **Discrete-event simulation (supplementary):** a simple `simpy`-based event loop for admins who want a stochastic run rather than the closed-form Erlang-C estimate, useful for showing variance, not just the expected value.
- Admin adjusts arrival rate / doctors / beds / service rate → system computes **Baseline vs. Scenario** side by side (queue length, wait time, doctor utilization, bed occupancy, hospital load), with an explicit "this is a scenario experiment, not a forecast" banner in the UI, per Part 19/38.

---

## PART L — FRONTEND STRUCTURE (all 20 pages from Part 30, confirmed, none removed)

Landing · Login · Registration · User Dashboard · Patient Assessment · Risk Result · Hospital Search · Hospital Details · Hospital Comparison · Recommendation Results · Recommendation Explanation · Doctor Registration · Doctor Dashboard · Admin Login · Admin Dashboard · Doctor Verification · Hospital Management · Operational Analytics · What-if Simulation · ML Model Performance.

Shared components: `HospitalCard`, `ScoreBreakdown`, `RiskBadge`, `WaitingTimeBadge`, `ComparisonTable`, `SimulationChart` (Recharts), `EmergencyDisclaimerBanner`.

---

## PART M — SECURITY (JWT + RBAC)

- JWT access tokens (short-lived) issued at login, role embedded in payload (`user`/`doctor`/`admin`), verified by Express middleware on every protected route.
- Passwords hashed with bcrypt (never stored/logged in plaintext).
- RBAC middleware: route-level role whitelists (`requireRole(['admin'])`), tested explicitly so a `user` token can never reach `/admin/*` or `/doctors/:id/verify`, and a `doctor` token can never reach `/admin/*`.
- All secrets (`JWT_SECRET`, `GEOAPIFY_API_KEY`, Mongo URI) read from `.env`, never committed, never sent to the frontend bundle.

---

## PART N — TESTING STRATEGY

Unit + integration tests covering: registration/login (valid & invalid), JWT expiry/tamper rejection, RBAC boundary cases (user→admin route, doctor→admin route), hospital search filters (including empty-result case), risk prediction on valid/invalid/missing-vitals input, waiting-time prediction, recommendation generation with incomplete hospital data (missing beds/coords), simulation with invalid (negative/zero) parameters. Framework: Jest + Supertest (Node), Pytest (FastAPI ML service).

---

## PART O — DEPLOYMENT STRATEGY

- Containerize each service (frontend, backend, ml-service) with Docker; `docker-compose` for local/dev.
- MongoDB Atlas (managed) or containerized Mongo for dev.
- Environment-specific `.env` files, never committed (`.gitignore` covers `.env*`).
- CI: GitHub Actions running lint + tests on push.
- Target deploy: any container host (Render/Railway/a college VM) — kept simple and documentable rather than over-engineered, appropriate for an academic capstone.

---

## PART P — WHY THIS QUALIFIES AS A 13-CREDIT MCA CAPSTONE

- **Three genuinely distinct data domains** (public government registry, real de-identified clinical records, engineered synthetic operational data) requiring three separate, correctly-scoped ETL pipelines — this alone is non-trivial data engineering.
- **Three different ML paradigms** (classification, regression, analytical queueing/simulation) integrated into one decision pipeline, not three disconnected demos.
- **A documented, honest leakage analysis** and **class-imbalance handling** — this is graduate-level rigor, not a copy-paste Kaggle notebook.
- **A full-stack system** with real RBAC/JWT security, a multi-service architecture (React/Node/Mongo/FastAPI), and a configurable, explainable scoring engine — not a single script.
- **External API integration** (Geoapify) handled with correct secret management.
- The integration itself — patient input → clinical risk → specialty/resource need → hospital matching → operational prediction → explainable ranked recommendation → admin what-if simulation — is the genuine contribution, exactly as your positioning statement describes.

---

## PART Q — RISKS AND LIMITATIONS (stated plainly, for your Chapter 14)

1. **Clinical dataset is very small (222 stays, 64 patients)** — a demo subset, not full MIMIC-IV-ED. Model metrics will be reported with wide uncertainty and should not be presented as clinically generalizable.
2. **No `age` field available** in the provided files — age-based risk stratification, common in real triage tools, cannot be modeled here.
3. **Acuity class imbalance** means the "official" 3-class LOW/MEDIUM/HIGH target has a near-empty LOW class (n=2); we default to a defensible binary target and present the 3-class version only as a caveated secondary result.
4. **`Emergency_Services` in the hospital directory is essentially empty (2 non-null values out of 30,273)** — our emergency-capability score is a derived text-keyword proxy, not authoritative hospital data, and must be labeled as such everywhere it's shown.
5. **Operational data covers only 5 simulated hospitals**, not all ~30,273 real hospitals. Only an explicit admin-confirmed `operationalHospitalId` links a master record to a CSV ID; no identity is inferred from the operational file. The directory and recommendation cards show dataset-derived estimates only for those mapped hospitals and display "Operational data not available" for the rest.
6. **~64% of hospitals have no coordinates** in the source file and require Geoapify geocoding, which is rate-limited and imperfect (some addresses may fail to resolve and will be shown as "location unavailable" rather than guessed).
7. This is **not a real-time system** — the operational CSV has no timestamps and is synthetic. Operational records are selected for the nearest weekday/hour slot and labeled estimates, never live availability.
8. The system **never diagnoses disease** and does not replace emergency triage protocols — enforced via the mandatory disclaimer banner on every risk/recommendation screen.

---

### Next step
Per your development rule, I'm stopping here and waiting for your confirmation before starting **Phase 1 (Project Setup + Git)**. Let me know if you want any part of this plan adjusted before we start writing code.
