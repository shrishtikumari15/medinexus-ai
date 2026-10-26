"""
MediNexus AI - ML microservice (FastAPI).
Called only by the Node.js backend, never directly by the React frontend.
"""
import json
from pathlib import Path
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, model_validator

from prediction.predict import predict_risk, predict_waiting_time
from prediction.specialty_matcher import identify_specialty_and_resources
from simulation.simulate import run_scenario_pair

app = FastAPI(
    title="MediNexus AI - ML Service",
    description="Clinical risk prediction, waiting-time prediction, specialty "
    "matching, and what-if resource simulation for the MediNexus AI capstone.",
    version="0.4.0",
)
WAITING_METRICS_PATH = Path(__file__).resolve().parent / "models" / "waiting_time_metrics.json"
RISK_METRICS_PATH = Path(__file__).resolve().parent / "models" / "risk_model_metrics.json"


@app.get("/health")
def health_check():
    return {"success": True, "service": "medinexus-ml-service", "status": "ok"}


class RiskPredictionRequest(BaseModel):
    temperature: Optional[float] = None
    heartrate: Optional[float] = None
    resprate: Optional[float] = None
    o2sat: Optional[float] = None
    sbp: Optional[float] = None
    dbp: Optional[float] = None
    pain: Optional[float] = None
    chiefComplaint: str
    gender: Optional[str] = "Other"
    race: Optional[str] = "UNKNOWN"
    arrivalTransport: Optional[str] = "UNKNOWN"


@app.post("/predict-risk")
def predict_risk_endpoint(req: RiskPredictionRequest):
    try:
        result = predict_risk(req.model_dump())
        return {"success": True, "data": result}
    except Exception as exc:  # noqa: BLE001 - surfaced to the caller for debugging in dev
        raise HTTPException(status_code=500, detail=str(exc)) from exc


class WaitingTimeRequest(BaseModel):
    hospitalId: Literal["H001", "H002", "H003", "H004", "H005"]
    patientArrivals: float = Field(ge=0)
    doctorsAvailable: float = Field(ge=0)
    totalBeds: float = Field(gt=0)
    bedsAvailable: float = Field(ge=0)
    bedOccupancy: float = Field(ge=0, le=1)
    queueLength: float = Field(ge=0)
    doctorUtilization: float = Field(ge=0, le=1)
    diagnosticUtilization: float = Field(ge=0, le=1)
    hospitalLoad: float = Field(ge=0, le=1)
    hour: int = Field(ge=0, le=23)
    dayOfWeek: int = Field(ge=0, le=6)

    @model_validator(mode="after")
    def validate_bed_counts(self):
        if self.bedsAvailable > self.totalBeds:
            raise ValueError("bedsAvailable cannot exceed totalBeds.")
        return self


@app.post("/predict-waiting-time")
@app.post("/predict/waiting-time")
def predict_waiting_time_endpoint(req: WaitingTimeRequest):
    try:
        result = predict_waiting_time(req.model_dump())
        return {"success": True, "data": result}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/waiting-time-metrics")
def waiting_time_metrics_endpoint():
    if not WAITING_METRICS_PATH.is_file():
        raise HTTPException(status_code=503, detail="Waiting-time model metrics are unavailable; train the model first.")
    try:
        with WAITING_METRICS_PATH.open(encoding="utf-8") as metrics_file:
            return {"success": True, "data": json.load(metrics_file)}
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=500, detail=f"Could not read waiting-time model metrics: {exc}") from exc


@app.get("/risk-model-metrics")
def risk_model_metrics_endpoint():
    if not RISK_METRICS_PATH.is_file():
        raise HTTPException(status_code=503, detail="Risk model metrics are unavailable; train the clinical model first.")
    try:
        with RISK_METRICS_PATH.open(encoding="utf-8") as metrics_file:
            return {"success": True, "data": json.load(metrics_file)}
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=500, detail=f"Could not read risk model metrics: {exc}") from exc


class SpecialtyRequest(BaseModel):
    chiefComplaint: str
    riskLabel: Optional[str] = None


@app.post("/identify-specialty")
def identify_specialty_endpoint(req: SpecialtyRequest):
    result = identify_specialty_and_resources(req.chiefComplaint, req.riskLabel)
    return {"success": True, "data": result}


class ScenarioParams(BaseModel):
    arrivalRatePerHour: float
    doctorsAvailable: int
    bedsAvailable: int
    serviceRateMinutesPerPatient: float


class SimulationRequest(BaseModel):
    baseline: ScenarioParams
    scenario: ScenarioParams


@app.post("/simulate")
def simulate_endpoint(req: SimulationRequest):
    try:
        result = run_scenario_pair(req.baseline.model_dump(), req.scenario.model_dump())
        return {"success": True, "data": result}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
