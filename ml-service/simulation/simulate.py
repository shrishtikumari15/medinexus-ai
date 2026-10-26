"""
Orchestrates a Baseline vs Scenario what-if comparison (Phase 13), combining
the analytical Erlang C estimate with a discrete-event simulation check.
"""
from simulation.discrete_event_sim import run_discrete_event_simulation
from simulation.queueing_theory import erlang_c_metrics


def run_scenario_pair(baseline: dict, scenario: dict) -> dict:
    """
    baseline/scenario each: { arrivalRatePerHour, doctorsAvailable,
    bedsAvailable, serviceRateMinutesPerPatient }
    """

    def run_one(params):
        analytical = erlang_c_metrics(
            arrival_rate_per_hour=params["arrivalRatePerHour"],
            num_servers=params["doctorsAvailable"],
            service_time_minutes=params["serviceRateMinutesPerPatient"],
            beds_available=params.get("bedsAvailable"),
        )
        simulated = run_discrete_event_simulation(
            arrival_rate_per_hour=params["arrivalRatePerHour"],
            num_servers=params["doctorsAvailable"],
            service_time_minutes=params["serviceRateMinutesPerPatient"],
        )
        return {"analytical": analytical, "simulated": simulated}

    baseline_results = run_one(baseline)
    scenario_results = run_one(scenario)

    def delta(key_path, extractor):
        b = extractor(baseline_results)
        s = extractor(scenario_results)
        if b is None or s is None:
            return None
        return round(s - b, 2)

    summary = {
        "queue_length_change": delta(
            "queue", lambda r: r["analytical"].get("queue_length")
        ),
        "waiting_time_minutes_change": delta(
            "wait", lambda r: r["analytical"].get("waiting_time_minutes")
        ),
        "doctor_utilization_change": delta(
            "util", lambda r: r["analytical"].get("doctor_utilization")
        ),
    }

    return {
        "baseline": baseline_results,
        "scenario": scenario_results,
        "summary_deltas": summary,
        "method_note": (
            "'analytical' is the closed-form M/M/c (Erlang C) steady-state estimate. "
            "'simulated' is an independent discrete-event simulation (simpy) run over "
            "multiple replications - the two should agree closely when the analytical "
            "model's assumptions hold, and their agreement here is itself a validation "
            "check, not a guaranteed real-world forecast. Both are SCENARIO EXPERIMENTS, "
            "not predictions - use the Phase 9 XGBoost model for historical-pattern-based "
            "wait time prediction on the 5 simulated hospitals."
        ),
    }
