"""
Train and compare Random Forest and LightGBM on the leakage-safe clinical
dataset produced by preprocessing/clinical_etl.py.

Target: risk_binary (HIGH_URGENCY vs LOWER_URGENCY) - the primary,
statistically defensible target per the Phase 0 audit (the 3-class LOW
bucket has only 2 samples and cannot be reliably evaluated).

Saves:
  ml-service/models/random_forest_risk.joblib
  ml-service/models/lightgbm_risk.joblib
  ml-service/models/risk_preprocessor.joblib   (shared ColumnTransformer)
  ml-service/models/risk_model_metrics.json    (real metrics, not fabricated)

Run from ml-service/:
    python training/train_risk_models.py
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
# from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support,
    confusion_matrix, classification_report,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "processed" / "clinical" / "clinical_model_ready.csv"
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

NUMERIC_FEATURES = ["temperature", "heartrate", "resprate", "o2sat", "sbp", "dbp", "pain_numeric"]
CATEGORICAL_FEATURES = ["chief_complaint_bucket", "gender", "race", "arrival_transport"]
MISSING_FLAG_FEATURES = [
    "temperature_was_missing", "heartrate_was_missing", "resprate_was_missing",
    "o2sat_was_missing", "sbp_was_missing", "dbp_was_missing", "pain_was_missing",
]
ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES + MISSING_FLAG_FEATURES
TARGET = "risk_binary"
RANDOM_SEED = 42


def build_preprocessor():
    return ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ],
        remainder="passthrough",  # numeric + missing-flag columns pass through unchanged
    )


def evaluate(model_name, y_true, y_pred):
    acc = accuracy_score(y_true, y_pred)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, labels=["HIGH_URGENCY", "LOWER_URGENCY"], zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred, labels=["HIGH_URGENCY", "LOWER_URGENCY"]).tolist()
    report = classification_report(y_true, y_pred, zero_division=0, output_dict=True)
    return {
        "model": model_name,
        "accuracy": round(float(acc), 4),
        "precision_per_class": {"HIGH_URGENCY": round(float(precision[0]), 4), "LOWER_URGENCY": round(float(precision[1]), 4)},
        "recall_per_class": {"HIGH_URGENCY": round(float(recall[0]), 4), "LOWER_URGENCY": round(float(recall[1]), 4)},
        "f1_per_class": {"HIGH_URGENCY": round(float(f1[0]), 4), "LOWER_URGENCY": round(float(f1[1]), 4)},
        "support_per_class": {"HIGH_URGENCY": int(support[0]), "LOWER_URGENCY": int(support[1])},
        "confusion_matrix": {"labels": ["HIGH_URGENCY", "LOWER_URGENCY"], "matrix": cm},
        "full_classification_report": report,
        # High-risk recall gets special attention per the project brief -
        # missing a HIGH_URGENCY case is the costlier error type.
        "high_urgency_recall": round(float(recall[0]), 4),
    }


def train():
    df = pd.read_csv(DATA_PATH)
    train_df = df[df["split"] == "train"]
    test_df = df[df["split"] == "test"]

    X_train, y_train = train_df[ALL_FEATURES], train_df[TARGET]
    X_test, y_test = test_df[ALL_FEATURES], test_df[TARGET]

    preprocessor = build_preprocessor()

    rf_pipeline = Pipeline([
        ("preprocess", preprocessor),
        ("model", RandomForestClassifier(
            n_estimators=300, max_depth=6, min_samples_leaf=3,
            class_weight="balanced", random_state=RANDOM_SEED,
        )),
    ])
    rf_pipeline.fit(X_train, y_train)
    rf_pred = rf_pipeline.predict(X_test)
    rf_metrics = evaluate("random_forest", y_test, rf_pred)

    lgbm_pipeline = Pipeline([
        ("preprocess", preprocessor),
        ("model", LGBMClassifier(
            n_estimators=200, max_depth=4, learning_rate=0.05,
            class_weight="balanced", random_state=RANDOM_SEED, verbosity=-1,
        )),
    ])
    lgbm_pipeline.fit(X_train, y_train)
    lgbm_pred = lgbm_pipeline.predict(X_test)
    lgbm_metrics = evaluate("lightgbm", y_test, lgbm_pred)

    # Feature importance from Random Forest (interpretable baseline) - uses
    # the actual fitted OneHotEncoder categories, not guessed names.
    ohe = rf_pipeline.named_steps["preprocess"].named_transformers_["cat"]
    cat_feature_names = list(ohe.get_feature_names_out(CATEGORICAL_FEATURES))
    all_feature_names = cat_feature_names + NUMERIC_FEATURES + MISSING_FLAG_FEATURES
    importances = rf_pipeline.named_steps["model"].feature_importances_
    top_features = sorted(zip(all_feature_names, importances), key=lambda x: -x[1])[:10]

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(rf_pipeline, MODELS_DIR / "random_forest_risk.joblib")
    joblib.dump(lgbm_pipeline, MODELS_DIR / "lightgbm_risk.joblib")

    metrics_output = {
        "dataset_description": (
            "MIMIC-IV-ED demo subset (public, de-identified). "
            f"{len(df)} labeled ED stays from {df['subject_id'].nunique()} patients. "
            "Small-sample academic prototype, not a clinically validated model."
        ),
        "dataset_size": len(df),
        "train_size": len(train_df),
        "test_size": len(test_df),
        "target": TARGET,
        "target_note": (
            "Binary target used because the prompt's original 3-class LOW/MEDIUM/HIGH "
            "mapping produces a LOW class with only 2 samples in this dataset, which "
            "cannot be evaluated reliably. See docs/ for the full justification."
        ),
        "features": ALL_FEATURES,
        "random_forest": rf_metrics,
        "lightgbm": lgbm_metrics,
        "top_10_feature_importances_random_forest": [
            {"feature": f, "importance": round(float(i), 4)} for f, i in top_features
        ],
        "comparison_note": (
            "random_forest higher accuracy" if rf_metrics["accuracy"] > lgbm_metrics["accuracy"]
            else "lightgbm higher accuracy" if lgbm_metrics["accuracy"] > rf_metrics["accuracy"]
            else "both models tied on accuracy"
        ) + f" (RF={rf_metrics['accuracy']}, LightGBM={lgbm_metrics['accuracy']}) on this small test set "
          "(n={}); this comparison is illustrative, not a strong statistical claim.".format(len(test_df)),
    }

    with open(MODELS_DIR / "risk_model_metrics.json", "w") as f:
        json.dump(metrics_output, f, indent=2)

    return metrics_output


if __name__ == "__main__":
    result = train()
    print(json.dumps(result, indent=2))
