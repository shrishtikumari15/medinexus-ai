"""
Discrete-event simulation (Phase 13) using simpy, as a stochastic
supplement to the closed-form Erlang C estimate in queueing_theory.py.

Why both: Erlang C gives the exact expected value for an M/M/c queue in
steady state. This simulation instead runs the actual random arrival/service
process many times and reports the observed average - useful for showing
admins the variance around that expectation, and as an independent check
that the analytical formula is implemented correctly (they should agree
closely on average).
"""
import random
import statistics

import simpy


def _run_single_replication(arrival_rate_per_hour, num_servers, service_time_minutes, sim_hours, seed):
    rng = random.Random(seed)
    env = simpy.Environment()
    doctors = simpy.Resource(env, capacity=num_servers)

    wait_times = []
    queue_length_samples = []

    def patient(env, doctors):
        arrival_time = env.now
        with doctors.request() as req:
            yield req
            wait_times.append(env.now - arrival_time)
            service_time = rng.expovariate(1.0 / service_time_minutes)
            yield env.timeout(service_time)

    def arrival_process(env, doctors):
        while True:
            interarrival = rng.expovariate(arrival_rate_per_hour / 60.0)  # minutes between arrivals
            yield env.timeout(interarrival)
            env.process(patient(env, doctors))

    def queue_monitor(env, doctors):
        while True:
            queue_length_samples.append(len(doctors.queue))
            yield env.timeout(5)  # sample every 5 simulated minutes

    env.process(arrival_process(env, doctors))
    env.process(queue_monitor(env, doctors))
    env.run(until=sim_hours * 60)

    return {
        "mean_wait_minutes": statistics.mean(wait_times) if wait_times else 0.0,
        "mean_queue_length": statistics.mean(queue_length_samples) if queue_length_samples else 0.0,
        "patients_served": len(wait_times),
    }


def run_discrete_event_simulation(
    arrival_rate_per_hour: float,
    num_servers: int,
    service_time_minutes: float,
    sim_hours: float = 48,
    num_replications: int = 10,
) -> dict:
    """Runs multiple independent replications and reports mean +/- spread,
    so results reflect genuine simulation variance rather than one lucky run."""
    replications = [
        _run_single_replication(arrival_rate_per_hour, num_servers, service_time_minutes, sim_hours, seed=i)
        for i in range(num_replications)
    ]

    mean_waits = [r["mean_wait_minutes"] for r in replications]
    mean_queues = [r["mean_queue_length"] for r in replications]

    return {
        "num_replications": num_replications,
        "sim_hours_per_replication": sim_hours,
        "waiting_time_minutes": {
            "mean": round(statistics.mean(mean_waits), 2),
            "stdev": round(statistics.stdev(mean_waits), 2) if len(mean_waits) > 1 else 0.0,
        },
        "queue_length": {
            "mean": round(statistics.mean(mean_queues), 2),
            "stdev": round(statistics.stdev(mean_queues), 2) if len(mean_queues) > 1 else 0.0,
        },
        "avg_patients_served_per_replication": round(
            statistics.mean([r["patients_served"] for r in replications]), 1
        ),
    }
