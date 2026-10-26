from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_waiting_prediction_returns_documented_minutes_key():
    response = client.post(
        "/predict/waiting-time",
        json={
            "hospitalId": "H001",
            "patientArrivals": 5,
            "doctorsAvailable": 8,
            "totalBeds": 50,
            "bedsAvailable": 20,
            "bedOccupancy": 0.6,
            "queueLength": 2,
            "doctorUtilization": 0.5,
            "diagnosticUtilization": 0.4,
            "hospitalLoad": 0.45,
            "hour": 10,
            "dayOfWeek": 2,
        },
    )

    assert response.status_code == 200
    assert isinstance(response.json()["data"]["predicted_waiting_time_minutes"], float)


def test_waiting_metrics_endpoint_exposes_held_out_metrics():
    response = client.get("/waiting-time-metrics")

    assert response.status_code == 200
    assert {"mae_minutes", "rmse_minutes", "r2_score"} <= response.json()["data"].keys()


def test_waiting_prediction_rejects_invalid_bed_counts():
    response = client.post(
        "/predict/waiting-time",
        json={
            "hospitalId": "H001",
            "patientArrivals": 5,
            "doctorsAvailable": 8,
            "totalBeds": 20,
            "bedsAvailable": 21,
            "bedOccupancy": 0.6,
            "queueLength": 2,
            "doctorUtilization": 0.5,
            "diagnosticUtilization": 0.4,
            "hospitalLoad": 0.45,
            "hour": 10,
            "dayOfWeek": 2,
        },
    )

    assert response.status_code == 422
