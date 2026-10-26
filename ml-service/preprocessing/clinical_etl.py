"""
Clinical ETL pipeline.

Builds a leakage-safe, model-ready clinical dataset from the MIMIC-IV-ED
demo files, following exactly the Part D leakage analysis from Phase 0:

  SAFE (prediction-time, i.e. known at ED triage):
    - triage.csv: vitals, pain, chiefcomplaint, acuity (label source)
    - edstays.csv: gender, race, arrival_transport

  EXCLUDED (post-prediction-point, i.e. leakage):
    - diagnosis.csv, medrecon.csv, pyxis.csv, later vitalsign.csv readings
    - edstays.disposition (an outcome, not a feature)
    - subject_id, stay_id, hadm_id, intime/outtime (identifiers)

Target: binary HIGH_URGENCY (acuity 1-2) vs LOWER_URGENCY (acuity 3-4),
per the documented class-imbalance finding (LOW=acuity 4-5 has only 2
samples and cannot be evaluated on its own). The original 3-class mapping
is also emitted as a secondary column, clearly caveated.

Splits by subject_id (not stay_id) to prevent patient-level leakage across
train/test, since 64 patients account for 222 stays.

Run from ml-service/:
    python preprocessing/clinical_etl.py
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit

RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw" / "clinical"
OUT_DIR = Path(__file__).resolve().parents[2] / "data" / "processed" / "clinical"

TOP_N_COMPLAINTS = 15  # bucket the long tail into "other" to avoid a 200-row
                        # dataset exploding into hundreds of dummy columns


def bucket_chief_complaint(series, top_n=TOP_N_COMPLAINTS):
    normalized = series.fillna("UNKNOWN").str.strip().str.upper()
    top_values = normalized.value_counts().head(top_n).index
    return normalized.where(normalized.isin(top_values), other="OTHER")


def map_acuity_binary(acuity):
    if pd.isna(acuity):
        return None
    if acuity in (1, 2):
        return "HIGH_URGENCY"
    if acuity in (3, 4, 5):
        return "LOWER_URGENCY"
    return None


def map_acuity_3class(acuity):
    """Secondary/exploratory target - documented as having a near-empty
    LOW class (acuity 4-5, n=2 in this dataset)."""
    if pd.isna(acuity):
        return None
    if acuity in (1, 2):
        return "HIGH"
    if acuity == 3:
        return "MEDIUM"
    if acuity in (4, 5):
        return "LOW"
    return None


def run_etl(test_size=0.25, random_state=42):
    edstays = pd.read_csv(RAW_DIR / "edstays.csv")
    triage = pd.read_csv(RAW_DIR / "triage.csv")

    # triage is 1:1 with edstays on stay_id (verified in Phase 0 audit)
    merged = triage.merge(
        edstays[["stay_id", "subject_id", "gender", "race", "arrival_transport"]],
        on="stay_id",
        suffixes=("", "_ed"),
    )

    merged["chief_complaint_bucket"] = bucket_chief_complaint(merged["chiefcomplaint"])
    merged["risk_binary"] = merged["acuity"].apply(map_acuity_binary)
    merged["risk_3class"] = merged["acuity"].apply(map_acuity_3class)

    # Drop rows with no acuity label at all (15 rows per audit) - cannot be
    # used for supervised training, kept out rather than imputed (imputing
    # the TARGET would be fabricating labels).
    labeled = merged.dropna(subset=["risk_binary"]).copy()
    dropped_no_label = len(merged) - len(labeled)

    feature_cols_numeric = ["temperature", "heartrate", "resprate", "o2sat", "sbp", "dbp"]
    feature_cols_categorical = ["pain", "chief_complaint_bucket", "gender", "race", "arrival_transport"]

    model_ready = labeled[
        ["subject_id", "stay_id"] + feature_cols_numeric + feature_cols_categorical
        + ["risk_binary", "risk_3class", "acuity"]
    ].copy()

    # Missingness flags before imputation (kept as features - "was this
    # vital actually measured" can itself carry signal in ED triage data).
    for col in feature_cols_numeric:
        model_ready[f"{col}_was_missing"] = model_ready[col].isna().astype(int)
        model_ready[col] = model_ready[col].fillna(model_ready[col].median())

    model_ready["pain_was_missing"] = model_ready["pain"].isna().astype(int)
    # pain is entered as free text ("5", "10", "denies", etc.) in MIMIC-ED -
    # coerce to numeric where possible, else treat as missing.
    model_ready["pain_numeric"] = pd.to_numeric(model_ready["pain"], errors="coerce")
    model_ready["pain_numeric"] = model_ready["pain_numeric"].fillna(model_ready["pain_numeric"].median())
    model_ready.drop(columns=["pain"], inplace=True)

    # Patient-level split (GroupShuffleSplit on subject_id) to avoid the
    # same patient's repeat visits leaking across train/test.
    splitter = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
    train_idx, test_idx = next(splitter.split(model_ready, groups=model_ready["subject_id"]))
    model_ready["split"] = "train"
    model_ready.iloc[test_idx, model_ready.columns.get_loc("split")] = "test"

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / "clinical_model_ready.csv"
    model_ready.to_csv(out_path, index=False)

    summary = {
        "total_stays_after_triage_edstays_join": len(merged),
        "rows_dropped_missing_acuity_label": int(dropped_no_label),
        "rows_in_model_ready_dataset": len(model_ready),
        "unique_patients": int(model_ready["subject_id"].nunique()),
        "train_rows": int((model_ready["split"] == "train").sum()),
        "test_rows": int((model_ready["split"] == "test").sum()),
        "risk_binary_distribution": model_ready["risk_binary"].value_counts().to_dict(),
        "risk_3class_distribution": model_ready["risk_3class"].value_counts().to_dict(),
        "features_used": feature_cols_numeric + feature_cols_categorical + ["pain_numeric"],
        "excluded_as_leakage": [
            "diagnosis.csv (post-triage)", "medrecon.csv (median 79 min post-intime)",
            "pyxis.csv (medication administration during stay)",
            "vitalsign.csv repeat readings (median 203 min post-intime)",
            "edstays.disposition (outcome, not a feature)",
        ],
        "output_path": str(out_path),
    }
    return summary


if __name__ == "__main__":
    result = run_etl()
    print(json.dumps(result, indent=2, default=str))
