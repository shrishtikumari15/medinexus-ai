"""
M/M/c queueing theory (Erlang C) for the What-if Simulation module (Phase 13).

This computes EXPECTED steady-state behavior from first principles given
hypothetical parameters - distinct from the Phase 9 XGBoost model, which
predicts wait times FROM HISTORICAL PATTERNS in the synthetic operational
data. An admin can use this for "what if we had only 3 doctors" scenarios
that never occurred in the training data at all.

Standard M/M/c formulas (c = number of servers/doctors):
  rho    = lambda / (c * mu)                          [server utilization]
  P0     = [ sum_{n=0}^{c-1} (c*rho)^n/n! + (c*rho)^c/(c!*(1-rho)) ]^-1
  P_wait = (c*rho)^c / (c! * (1-rho)) * P0            [Erlang C formula]
  Lq     = P_wait * rho / (1 - rho)                   [expected queue length]
  Wq     = Lq / lambda                                [expected wait, hours]
  Ls     = Lq + lambda/mu                              [expected number in system]
  Ws     = Wq + 1/mu                                   [expected total time in system]
"""
import math


def erlang_c_metrics(arrival_rate_per_hour: float, num_servers: int, service_time_minutes: float, beds_available: float = None) -> dict:
    """
    arrival_rate_per_hour: patients arriving per hour (lambda)
    num_servers: number of doctors available (c)
    service_time_minutes: average time to serve one patient, in minutes
    beds_available: optional, used to derive a bed-occupancy proxy via Little's Law
    """
    if num_servers < 1:
        raise ValueError("num_servers must be at least 1")
    if service_time_minutes <= 0:
        raise ValueError("service_time_minutes must be positive")

    mu = 60.0 / service_time_minutes  # service rate per server, patients/hour
    c = num_servers
    lam = arrival_rate_per_hour
    rho = lam / (c * mu)

    if rho >= 1:
        # Unstable queue - arrivals exceed capacity. Report this explicitly
        # rather than returning a fabricated finite number; this is itself
        # a meaningful "what-if" finding (system would grow unboundedly).
        return {
            "stable": False,
            "utilization": round(rho, 4),
            "warning": (
                f"System is UNSTABLE: arrival rate ({lam}/hr) exceeds total service "
                f"capacity ({c * mu:.1f}/hr) at {c} doctors. Queue length and wait time "
                "would grow without bound; no finite steady-state estimate applies."
            ),
            "queue_length": None,
            "waiting_time_minutes": None,
            "doctor_utilization": round(rho, 4),
            "bed_occupancy": None,
        }

    a = c * rho  # offered load
    sum_terms = sum((a ** n) / math.factorial(n) for n in range(c))
    last_term = (a ** c) / (math.factorial(c) * (1 - rho))
    p0 = 1.0 / (sum_terms + last_term)
    p_wait = last_term * p0

    lq = p_wait * rho / (1 - rho)
    wq_hours = lq / lam if lam > 0 else 0.0
    ls = lq + lam / mu
    ws_hours = wq_hours + 1 / mu

    bed_occupancy = None
    if beds_available:
        # Little's Law approximation: average number of patients "in the
        # system" (waiting + being served) relative to available beds.
        bed_occupancy = round(min(1.0, ls / beds_available), 4)

    hospital_load = round((rho + (bed_occupancy or rho)) / 2, 4)

    return {
        "stable": True,
        "utilization": round(rho, 4),
        "probability_of_waiting": round(p_wait, 4),
        "queue_length": round(lq, 2),
        "waiting_time_minutes": round(wq_hours * 60, 2),
        "expected_number_in_system": round(ls, 2),
        "expected_time_in_system_minutes": round(ws_hours * 60, 2),
        "doctor_utilization": round(rho, 4),
        "bed_occupancy": bed_occupancy,
        "hospital_load": hospital_load,
    }
