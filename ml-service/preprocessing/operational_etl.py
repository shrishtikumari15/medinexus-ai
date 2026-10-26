"""
Operational CSV cleaning and feature preparation.

Missing/invalid source rows are excluded rather than imputed so operational
measurements are never replaced with fabricated values.
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

DATA_DIRECTORY = Path(__file__).resolve().parents[2] / "data" / "raw" / "operational"
DATASET_CANDIDATES = [
    Path(__file__).resolve().parents[2] / "medinexus_operational_dataset.csv",
    DATA_DIRECTORY / "medinexus_operational_dataset.csv",
    DATA_DIRECTORY / "operational_dataset.csv",
]
OUT_PATH = Path(__file__).resolve().parents[2] / "data" / "processed" / "operational" / "operational_model_ready.csv"

RATIO_COLS = ["bed_occupancy", "doctor_utilization", "diagnostic_utilization", "hospital_load"]
INTEGER_COLS = ["day_of_week", "hour"]
NON_NEGATIVE_COLS = [
    "patient_arrivals",
    "doctors_available",
    "total_beds",
    "beds_available",
    "queue_length",
    "waiting_time_minutes",
]
EXPECTED_COLUMNS = [
    "hospital_id", "day_of_week", "hour", "patient_arrivals", "doctors_available",
    "total_beds", "beds_available", "bed_occupancy", "queue_length",
    "doctor_utilization", "diagnostic_utilization", "hospital_load", "waiting_time_minutes",
]
VALID_HOSPITAL_IDS = {"H001", "H002", "H003", "H004", "H005"}


def source_path():
    for candidate in DATASET_CANDIDATES:
        if candidate.is_file():
            return candidate
    raise FileNotFoundError(
        f"Operational CSV not found. Expected one of: {', '.join(str(path) for path in DATASET_CANDIDATES)}"
    )


def run_etl():
    input_path = source_path()
    df = pd.read_csv(input_path)

    missing_cols = [column for column in EXPECTED_COLUMNS if column not in df.columns]
    if missing_cols:
        raise ValueError(f"Expected columns not found in {input_path.name}: {missing_cols}")

    source = df[EXPECTED_COLUMNS].copy()
    source["hospital_id"] = source["hospital_id"].astype("string").str.strip().str.upper()
    for column in EXPECTED_COLUMNS[1:]:
        source[column] = pd.to_numeric(source[column], errors="coerce")

    invalid_hospital_id = ~source["hospital_id"].isin(VALID_HOSPITAL_IDS)
    missing_or_non_numeric = source[EXPECTED_COLUMNS].isna().any(axis=1)
    invalid_integer = pd.Series(False, index=source.index)
    for column in INTEGER_COLS:
        invalid_integer |= source[column].notna() & (source[column] % 1 != 0)
    invalid_range = (
        (source["day_of_week"] < 0)
        | (source["day_of_week"] > 6)
        | (source["hour"] < 0)
        | (source["hour"] > 23)
        | (source[NON_NEGATIVE_COLS] < 0).any(axis=1)
        | (source["total_beds"] <= 0)
        | (source["beds_available"] > source["total_beds"])
        | ((source[RATIO_COLS] < 0) | (source[RATIO_COLS] > 1)).any(axis=1)
    )
    invalid_mask = invalid_hospital_id | missing_or_non_numeric | invalid_integer | invalid_range
    valid = source.loc[~invalid_mask].copy()

    duplicate_count = int(valid.duplicated(subset=EXPECTED_COLUMNS).sum())
    valid = valid.drop_duplicates(subset=EXPECTED_COLUMNS, keep="first")
    if valid.empty:
        raise ValueError("No valid operational records remain after validation.")

    valid["day_of_week"] = valid["day_of_week"].astype(int)
    valid["hour"] = valid["hour"].astype(int)
    valid["hour_sin"] = np.sin(2 * np.pi * valid["hour"] / 24)
    valid["hour_cos"] = np.cos(2 * np.pi * valid["hour"] / 24)
    valid["day_of_week_sin"] = np.sin(2 * np.pi * valid["day_of_week"] / 7)
    valid["day_of_week_cos"] = np.cos(2 * np.pi * valid["day_of_week"] / 7)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    valid.to_csv(OUT_PATH, index=False)

    summary = {
        "dataset_label": "Synthetic operational dataset; H001-H005; not real hospital telemetry",
        "source_path": str(input_path),
        "input_rows": int(len(df)),
        "valid_rows": int(len(valid)),
        "invalid_rows_excluded": int(invalid_mask.sum()),
        "exact_duplicate_rows_removed": duplicate_count,
        "hospital_ids": sorted(valid["hospital_id"].unique().tolist()),
        "missing_or_non_numeric_rows": int(missing_or_non_numeric.sum()),
        "invalid_hospital_id_rows": int(invalid_hospital_id.sum()),
        "invalid_numeric_or_range_rows": int((invalid_integer | invalid_range).sum()),
        "waiting_time_minutes_stats": {
            "min": float(valid["waiting_time_minutes"].min()),
            "max": float(valid["waiting_time_minutes"].max()),
            "mean": round(float(valid["waiting_time_minutes"].mean()), 2),
            "std": round(float(valid["waiting_time_minutes"].std()), 2),
        },
        "features_added": ["hour_sin", "hour_cos", "day_of_week_sin", "day_of_week_cos"],
        "output_path": str(OUT_PATH),
    }
    return summary


if __name__ == "__main__":
    result = run_etl()
    print(json.dumps(result, indent=2))
