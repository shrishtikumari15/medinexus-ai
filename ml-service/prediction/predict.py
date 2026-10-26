"""
Loads the trained artifacts from Phases 7, 9, 10 once at import time and
exposes simple predict functions for main.py's endpoints to call.
"""
from pathlib import Path

import joblib
import pandas as pd

from prediction.specialty_matcher import identify_specialty_and_resources

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

_risk_model = joblib.load(MODELS_DIR / "lightgbm_risk.joblib")  # LightGBM won Phase 7's comparison on recall
_waiting_model = joblib.load(MODELS_DIR / "xgboost_waiting_time.joblib")

RISK_NUMERIC_FEATURES = ["temperature", "heartrate", "resprate", "o2sat", "sbp", "dbp", "pain_numeric"]
RISK_CATEGORICAL_FEATURES = ["chief_complaint_bucket", "gender", "race", "arrival_transport"]
RISK_MISSING_FLAGS = [
    "temperature_was_missing", "heartrate_was_missing", "resprate_was_missing",
    "o2sat_was_missing", "sbp_was_missing", "dbp_was_missing", "pain_was_missing",
]

WAITING_NUMERIC_FEATURES = [
    "patient_arrivals", "doctors_available", "total_beds", "beds_available",
    "bed_occupancy", "queue_length", "doctor_utilization", "diagnostic_utilization",
    "hospital_load", "hour_sin", "hour_cos", "day_of_week_sin", "day_of_week_cos",
]


def predict_risk(payload: dict) -> dict:
    """
    payload keys: temperature, heartrate, resprate, o2sat, sbp, dbp, pain,
    chiefComplaint, gender, race, arrivalTransport (any may be null/missing).
    """
    row = {}
    for col in ["temperature", "heartrate", "resprate", "o2sat", "sbp", "dbp"]:
        val = payload.get(col)
        row[col] = val
        row[f"{col}_was_missing"] = 1 if val is None else 0

    pain_val = payload.get("pain")
    row["pain_numeric"] = pain_val
    row["pain_was_missing"] = 1 if pain_val is None else 0

    row["chief_complaint_bucket"] = (payload.get("chiefComplaint") or "UNKNOWN").upper()
    row["gender"] = payload.get("gender", "Other")
    row["race"] = payload.get("race", "UNKNOWN")
    row["arrival_transport"] = payload.get("arrivalTransport", "UNKNOWN")

    # Fill missing numerics with 0 at inference time is unsafe (model saw
    # median-imputed training data) - here we impute with a neutral
    # mid-range placeholder per-field is out of scope for a single-row
    # inference call, so we require the frontend to send best-effort vitals;
    # any still-missing numeric is passed as NaN and the pipeline's
    # OneHotEncoder/passthrough will surface it - tree models handle NaN
    # natively in this scikit-learn/lightgbm combination for the numeric path.
    df = pd.DataFrame([row])[RISK_CATEGORICAL_FEATURES + ["temperature", "heartrate", "resprate", "o2sat", "sbp", "dbp", "pain_numeric"] + RISK_MISSING_FLAGS]

    pred = _risk_model.predict(df)[0]
    proba = _risk_model.predict_proba(df)[0]
    classes = list(_risk_model.classes_)
    proba_high = float(proba[classes.index("HIGH_URGENCY")]) if "HIGH_URGENCY" in classes else None

    specialty_result = identify_specialty_and_resources(payload.get("chiefComplaint", ""), risk_label=pred)

    return {
        "riskLabel": pred,
        "probabilityHighUrgency": round(proba_high, 4) if proba_high is not None else None,
        "modelName": "lightgbm",
        "modelVersion": "phase7_v1",
        "requiredSpecialties": specialty_result["required_specialties"],
        "requiredResources": specialty_result["required_resources"],
        "specialtyMatchTrace": specialty_result["matched_rules"],
        "disclaimer": specialty_result["disclaimer"],
    }


def predict_waiting_time(payload: dict) -> dict:
    """
    payload keys: hospitalId (H001-H005), patientArrivals, doctorsAvailable,
    totalBeds, bedsAvailable, bedOccupancy, queueLength, doctorUtilization,
    diagnosticUtilization, hospitalLoad, hour, dayOfWeek.
    """
    import numpy as np

    hour = payload["hour"]
    day_of_week = payload["dayOfWeek"]
    row = {
        "hospital_id": payload["hospitalId"],
        "patient_arrivals": payload["patientArrivals"],
        "doctors_available": payload["doctorsAvailable"],
        "total_beds": payload["totalBeds"],
        "beds_available": payload["bedsAvailable"],
        "bed_occupancy": payload["bedOccupancy"],
        "queue_length": payload["queueLength"],
        "doctor_utilization": payload["doctorUtilization"],
        "diagnostic_utilization": payload["diagnosticUtilization"],
        "hospital_load": payload["hospitalLoad"],
        "hour_sin": np.sin(2 * np.pi * hour / 24),
        "hour_cos": np.cos(2 * np.pi * hour / 24),
        "day_of_week_sin": np.sin(2 * np.pi * day_of_week / 7),
        "day_of_week_cos": np.cos(2 * np.pi * day_of_week / 7),
    }
    df = pd.DataFrame([row])[["hospital_id"] + WAITING_NUMERIC_FEATURES]
    pred_minutes = float(_waiting_model.predict(df)[0])
    predicted_wait = round(max(0.0, pred_minutes), 1)
    estimator_name = type(_waiting_model.named_steps["model"]).__name__.lower()
    model_name = "xgboost" if "xgb" in estimator_name else "random_forest"

    return {
        "expectedWaitMinutes": predicted_wait,
        "predicted_waiting_time_minutes": predicted_wait,
        "modelName": model_name,
        "modelVersion": "operational_waiting_time_v1",
        "scopeNote": "Estimate trained on the synthetic operational dataset; not real-time and limited to the H001-H005 model IDs.",
    }
