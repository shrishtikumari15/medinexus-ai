"""
Specialty / Required-Resource identification (Phase 10).

Deliberately a RULE-BASED, explainable matcher rather than an ML classifier
for this step - a 207-row clinical dataset cannot support training a
reliable multi-label specialty classifier, and rule-based matching keeps
every decision traceable to a specific keyword, which matters for the
project's "explainable recommendation" requirement (Part 14/Part J).

Terminology is deliberately non-diagnostic per the project's ethics
requirements: this module identifies a "Required Specialty" / "Required
Resource", never a disease diagnosis.

Usage:
    from prediction.specialty_matcher import identify_specialty_and_resources
    result = identify_specialty_and_resources("Chest pain, Dyspnea", risk_label="HIGH_URGENCY")
"""
import json
from pathlib import Path

RULES_PATH = Path(__file__).resolve().parent / "specialty_rules.json"

with open(RULES_PATH) as f:
    _CONFIG = json.load(f)

_RULES = _CONFIG["rules"]
_FALLBACK = _CONFIG["fallback"]
_HIGH_URGENCY_ADDON = _CONFIG["high_urgency_addon"]


def identify_specialty_and_resources(chief_complaint: str, risk_label: str | None = None) -> dict:
    """
    Returns a dict with:
      - required_specialties: list[str]
      - required_resources: list[str]  (de-duplicated)
      - matched_rules: list[dict]      (which keyword triggered which specialty - the "why")
      - disclaimer: str
    """
    text = (chief_complaint or "").strip().lower()

    matched_specialties = []
    matched_resources = []
    matched_rules_trace = []

    import re
    for rule in _RULES:
        hit_keywords = []
        for kw in rule["keywords"]:
            pattern = r'\b' + re.escape(kw) + r'\b' if len(kw) <= 4 else re.escape(kw)
            if re.search(pattern, text):
                hit_keywords.append(kw)
        if hit_keywords:
            matched_specialties.append(rule["specialty"])
            matched_resources.extend(rule["required_resources"])
            matched_rules_trace.append({
                "specialty": rule["specialty"],
                "matched_keywords": hit_keywords,
            })

    if not matched_specialties:
        matched_specialties.append(_FALLBACK["specialty"])
        matched_resources.extend(_FALLBACK["required_resources"])
        matched_rules_trace.append({
            "specialty": _FALLBACK["specialty"],
            "matched_keywords": [],
            "note": _FALLBACK["applies_when"],
        })

    if risk_label == "HIGH_URGENCY":
        matched_resources.extend(_HIGH_URGENCY_ADDON["required_resources"])

    # De-duplicate while preserving order
    def dedupe(items):
        seen = []
        for i in items:
            if i not in seen:
                seen.append(i)
        return seen

    return {
        "input_chief_complaint": chief_complaint,
        "required_specialties": dedupe(matched_specialties),
        "required_resources": dedupe(matched_resources),
        "matched_rules": matched_rules_trace,
        "disclaimer": (
            "This is a Required Specialty / Potential Care Requirement estimate based on "
            "keyword matching against the reported chief complaint. It is NOT a medical "
            "diagnosis and does not replace clinical judgment or emergency triage protocols."
        ),
    }


if __name__ == "__main__":
    # Smoke test against real chief complaints observed in triage.csv
    samples = [
        ("Chest pain, Transfer", "HIGH_URGENCY"),
        ("SOB", "HIGH_URGENCY"),
        ("Abd pain, n/v/d", "LOWER_URGENCY"),
        ("SEIZURE", "HIGH_URGENCY"),
        ("R Leg pain, R Leg swelling", "LOWER_URGENCY"),
        ("SI", "HIGH_URGENCY"),
        ("Some totally unmatched text", None),
    ]
    for complaint, risk in samples:
        result = identify_specialty_and_resources(complaint, risk)
        print(f"\nInput: {complaint!r} (risk={risk})")
        print(f"  Specialties: {result['required_specialties']}")
        print(f"  Resources:   {result['required_resources']}")
        print(f"  Trace:       {result['matched_rules']}")
