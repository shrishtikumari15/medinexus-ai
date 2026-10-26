import csv

import pandas as pd

from preprocessing import operational_etl


def test_etl_excludes_invalid_and_duplicate_rows_without_imputing(tmp_path, monkeypatch):
    source = tmp_path / "medinexus_operational_dataset.csv"
    output = tmp_path / "processed.csv"
    rows = [
        {
            "index": 1,
            "hospital_id": "H001",
            "day_of_week": 0,
            "hour": 2,
            "patient_arrivals": 4,
            "doctors_available": 5,
            "total_beds": 20,
            "beds_available": 8,
            "bed_occupancy": 0.6,
            "queue_length": 3,
            "doctor_utilization": 0.4,
            "diagnostic_utilization": 0.5,
            "hospital_load": 0.55,
            "waiting_time_minutes": 18.5,
        },
        {
            "index": 2,
            "hospital_id": "H001",
            "day_of_week": 0,
            "hour": 2,
            "patient_arrivals": 4,
            "doctors_available": 5,
            "total_beds": 20,
            "beds_available": 8,
            "bed_occupancy": 0.6,
            "queue_length": 3,
            "doctor_utilization": 0.4,
            "diagnostic_utilization": 0.5,
            "hospital_load": 0.55,
            "waiting_time_minutes": 18.5,
        },
        {
            "index": 3,
            "hospital_id": "H999",
            "day_of_week": 0,
            "hour": 2,
            "patient_arrivals": 4,
            "doctors_available": 5,
            "total_beds": 20,
            "beds_available": 8,
            "bed_occupancy": 0.6,
            "queue_length": 3,
            "doctor_utilization": 0.4,
            "diagnostic_utilization": 0.5,
            "hospital_load": 0.55,
            "waiting_time_minutes": 18.5,
        },
        {
            "index": 4,
            "hospital_id": "H002",
            "day_of_week": 0,
            "hour": 2,
            "patient_arrivals": "",
            "doctors_available": 5,
            "total_beds": 20,
            "beds_available": 8,
            "bed_occupancy": 0.6,
            "queue_length": 3,
            "doctor_utilization": 0.4,
            "diagnostic_utilization": 0.5,
            "hospital_load": 0.55,
            "waiting_time_minutes": 18.5,
        },
    ]
    with source.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    monkeypatch.setattr(operational_etl, "DATASET_CANDIDATES", [source])
    monkeypatch.setattr(operational_etl, "OUT_PATH", output)

    summary = operational_etl.run_etl()
    clean = pd.read_csv(output)

    assert summary["input_rows"] == 4
    assert summary["valid_rows"] == 1
    assert summary["invalid_rows_excluded"] == 2
    assert summary["exact_duplicate_rows_removed"] == 1
    assert clean.loc[0, "waiting_time_minutes"] == 18.5
    assert "hour_sin" in clean.columns
