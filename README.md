# MediNexus AI

**Intelligent Hospital Recommendation & Resource Management System**
13-credit MCA capstone project.

MediNexus AI is an AI-assisted multi-hospital decision-support platform. It
analyzes patient requirements, predicts clinical urgency and expected
waiting time, ranks hospitals with an explainable suitability score, and
gives administrators a what-if resource simulation tool.

> **Disclaimer:** MediNexus AI provides AI-assisted decision support and is
> not a substitute for professional medical advice or emergency care. It
> does not diagnose disease, prescribe treatment, or override emergency
> triage protocols.

## Project status

This repository is being built **phase by phase**. See
[`docs/MediNexus_AI_Phase0_DataAudit_Architecture.md`](docs/MediNexus_AI_Phase0_DataAudit_Architecture.md)
for the full data audit, leakage analysis, traceability matrix, and system
architecture that every later phase builds on.

**Completed:** Phase 0 (data audit + architecture), Phase 1 (project setup).
**Next:** Phase 2 (MongoDB models).

## Repository layout

```
medinexus-ai/
├── frontend/        React + Vite + Tailwind + Recharts UI
├── backend/         Node.js + Express REST API, MongoDB, JWT/RBAC auth
├── ml-service/      Python FastAPI service — Random Forest, LightGBM,
│                    XGBoost, and the queueing/simulation engine
├── data/
│   ├── raw/         Original uploaded datasets, never modified
│   └── processed/   Cleaned/model-ready datasets produced by ETL scripts
└── docs/            Architecture, data audit, and report-support material
```

## Caregiver mode

User accounts can manage family profiles from **Dashboard → Family Members**.
Dependents are private to their owning user. Removing a profile deactivates it
for future assessments while retaining its name/relationship and assessment
history snapshots. Assessment history can be filtered to the account holder,
all family assessments, or one active dependent.

Authenticated user API routes:

- `GET/POST /api/v1/dependents` — list or add a family profile.
- `PUT/DELETE /api/v1/dependents/:id` — edit or deactivate an owned profile.
- `GET /api/v1/dependents/:id/assessments` — view that profile's assessment history.
- `POST /api/v1/assessments` accepts optional `dependentId`; history supports
   `?scope=all|mine|family` or `?dependentId=<id>`.

Age is calculated from date of birth and stored as `ageAtAssessment` for the
result and audit history. It is **not** passed to the clinical risk model:
the existing trained model has no age feature, so its artifacts and inference
contract remain unchanged.

## Doctor and hospital discovery

The public directory is available at `/doctors` and `/hospitals`. Hospital
search accepts `state`, `city`, and `specialty`; doctor search accepts the same
filters at `GET /api/v1/doctors`. Doctor records are separate from doctor login
accounts and use the National Medical Register (NMC) as the registration
reference. MediNexus does not currently scrape or claim a live NMR connection:
an administrator enters or imports records after checking the public NMR
source. A registry reference is not independent MediNexus verification.

Only NMR-supported registration fields should be entered from NMR. Specialty,
qualification, experience, and hospital association each require a separate
HTTPS source URL. Unavailable fields remain empty and the UI labels them
`Not available from public source`. The admin interface is at `/admin/doctors`.
For a sourced batch, an admin can also call `POST /api/v1/admin/doctors/import`
with a `records` array (up to 500 rows). The minimum registration fields are
`name`, `registrationNumber`, `stateMedicalCouncil`, and the official
`sourceUrl` (`https://nmr.nmc.org.in/search-doctor`).

Hospital records can be managed at `/admin/hospitals`; protected endpoints are
`GET/POST /api/v1/admin/hospitals` and `PATCH /api/v1/admin/hospitals/:id`.
Doctor-reference updates use `GET/POST /api/v1/admin/doctors` and
`PATCH /api/v1/admin/doctors/:id`. These write endpoints require an admin JWT.
Hospital-to-operational-ID links are managed in the hospital editor and must
be verified before an admin assigns one of H001-H005. Each operational ID can
be linked to at most one hospital. Hospital names, locations, specialties, and
facilities come only from the hospital master record; the operational CSV
contains no identity data and is never used to guess this mapping.

Mapped hospital search/detail responses include a dataset row selected for the
nearest weekday/hour slot and report bed availability from that row. Unmapped
hospitals display `Operational data not available`. The source has no
timestamps and is synthetic, so its waiting-time output is labeled
**Estimated Waiting Time**, never real-time. Bed availability is derived as
`beds_available / total_beds`; occupied beds are calculated as
`total_beds - beds_available`. Hospital ranking continues to use the existing
normalized 0-100 specialty, facility, capacity, emergency, bed, waiting-time,
distance, and network-demand components; CSV-derived operational scores are
only used when a hospital has an explicit ID mapping.

Additional endpoints:

- `GET /api/v1/hospitals/:id/operations?day_of_week=0&hour=10` — mapped
  operational estimate, or an explicit unavailable response. The selected
  day/hour are optional and default to the current Asia/Kolkata weekday/hour.
- `GET /api/v1/operations/reference` — dataset median estimates for total and
  available beds. These are shown within existing hospital cards only as a
  synthetic dataset reference; the CSV has no verified mapping to real
  hospital identity records, so the values are not specific to any listed
  hospital.
- `POST /api/v1/predict/waiting-time` — regression estimate from supplied
  operational features; returns `predicted_waiting_time_minutes`.
- `GET /api/v1/admin/waiting-time-metrics` — admin-authenticated held-out
  MAE, RMSE, R², model, and dataset metrics, shown at `/admin/model-performance`.

The operational ETL prefers
`data/raw/operational/medinexus_operational_dataset.csv` (or a root-level file
with that name) and falls back to the existing
`data/raw/operational/operational_dataset.csv`. Missing, non-numeric,
out-of-range, and unknown-hospital rows are excluded rather than imputed;
exact duplicates are removed before training. The CSV `index` field, if
present, is not used as a model feature.

Before deploying this schema change to an existing MongoDB database, run from
`backend/` with the backend `.env` configured:

```powershell
node src/scripts/migrateDiscoverySchema.js
```

This updates the hospital source-row index to allow admin-created hospitals
without a fabricated source row and creates registry-doctor indexes. No new
environment variables are required; `GEOAPIFY_API_KEY` remains backend-only.

## Datasets

Three separate data domains, kept separate throughout the pipeline (see
`docs/`):

1. **Hospital directory** (`data/raw/hospital/hospital_directory.csv`) —
   30,273 real Indian hospital records (Government of India registry).
2. **Clinical data** (`data/raw/clinical/*.csv`) — MIMIC-IV-ED demo subset
   (222 ED stays, 64 patients). Used for clinical risk/urgency modeling.
3. **Operational data** (`data/raw/operational/operational_dataset.csv`, or
   `medinexus_operational_dataset.csv`) —
   **synthetic**, 10,000 rows covering 5 simulated hospitals. Used for
   waiting-time prediction and what-if simulation. Never presented as real
   hospital operational data.

## Running locally

### Option A: Docker Compose (one command, all 4 services)
```bash
cp .env.example .env      # fill in JWT_SECRET, GEOAPIFY_API_KEY, ADMIN_SEED_EMAIL/PASSWORD
docker compose up --build
```
This starts MongoDB, the ML service, the backend, and the frontend together,
wired with the correct internal URLs. **Note:** this Docker setup has not
been run end-to-end in the environment this project was built in (no Docker
available there) - the Dockerfiles and compose file follow standard, widely
used patterns, but test the full `docker compose up` yourself before relying
on it, and open an issue with the exact error if something doesn't start.

After the stack is up, seed the first admin account (see below), since
admins cannot self-register through the API.

### Option B: Run each service directly (what was actually tested during development)

#### 1. Backend (Node.js/Express)
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, GEOAPIFY_API_KEY
npm install
npm run dev                # http://localhost:5000
```

Then, in a separate terminal, seed the first admin account (required once -
admins cannot self-register through the public API):
```bash
cd backend
ADMIN_SEED_EMAIL=admin@medinexus.local ADMIN_SEED_PASSWORD=ChangeMe123! node src/scripts/seedAdmin.js
```

Then import the cleaned hospital data (run the Hospital ETL first if you
haven't - see the ml-service section below):
```bash
node src/scripts/importHospitals.js
```

#### 2. ML service (Python/FastAPI)
```bash
cd ml-service
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the ETL pipelines once to generate processed data (see Part C of the
# Phase 0 doc for what each does):
python preprocessing/hospital_etl.py
python preprocessing/clinical_etl.py
python preprocessing/operational_etl.py

# Train the models once to generate the .joblib files + metrics JSON the
# API serves (already included in this repo, but re-run after any ETL change):
python training/train_risk_models.py
python training/train_waiting_model.py

# In development, the backend automatically starts the local ML service on
# the first prediction request when ML_SERVICE_URL points to localhost and
# ml-service/venv has its dependencies installed. To start it manually instead,
# use Windows PowerShell from the repository root in a separate terminal:
.\start-ml-service.ps1
```

#### 3. Frontend (React/Vite)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

### Verify Phase 1 is working
- `GET http://localhost:5000/api/v1/health` → `{ success: true, status: "ok" }`
  (requires MongoDB running/reachable at `MONGO_URI`)
- `GET http://localhost:8000/health` → `{ success: true, status: "ok" }`
- Open `http://localhost:5173` — should show "Backend API status: connected"

### Run the backend test suite (unit + integration)
```bash
cd backend
npm test
```
This runs all unit tests (auth, RBAC, recommendation scoring, sensitivity
analysis) plus the Phase 17 integration test, which exercises the real
assessment -> ML call -> scoring -> recommendation chain with only the
database and ML HTTP client mocked. No live MongoDB or ML service is
required for `npm test` to pass.

### Run the ML service test suite
```bash
cd ml-service
source venv/bin/activate
pytest tests/ -v
```
Covers the Erlang C queueing formulas (including a real cross-check against
the project's own worked baseline example), the specialty-matching rule
engine, and every FastAPI endpoint - run against the actual trained Phase
7/9 models, not mocks.

## Environment variables & secrets

All secrets are read from `.env` files (git-ignored) via a single config
module per service (`backend/src/config/env.js`). **Never** hard-code API
keys or JWT secrets in source files.

> If a real API key was ever pasted into a chat, email, ticket, or shared
> doc, rotate it in the provider's dashboard before deploying — treat it as
> exposed regardless of the provider's free-tier status.

## Documentation

- [`docs/CAPSTONE_REPORT.md`](docs/CAPSTONE_REPORT.md) — full 16-chapter academic report
- [`docs/MediNexus_AI_Phase0_DataAudit_Architecture.md`](docs/MediNexus_AI_Phase0_DataAudit_Architecture.md) — data audit, leakage analysis, traceability matrix, architecture
- [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) — full REST API specification
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — viva demonstration walkthrough
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deployment guide and pre-deploy checklist
- [`docs/presentation/MediNexus_AI_Capstone_Presentation.pptx`](docs/presentation/MediNexus_AI_Capstone_Presentation.pptx) — presentation deck

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the production checklist,
environment variables, CI setup, and recommended hosting for each service.

## License note on datasets

The clinical files under `data/raw/clinical/` are distributed under the
license in `data/raw/clinical/LICENSE.txt` (see also `SHA256SUMS.txt` for
integrity verification of the original MIMIC-IV-ED demo release). The
hospital directory is public Government of India data. The operational
dataset is synthetic and was created for this project.
