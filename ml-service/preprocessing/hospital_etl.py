"""
Hospital ETL pipeline.

Input:  data/raw/hospital/hospital_directory.csv  (30,273 rows, untouched)
Output: data/processed/hospital/hospitals_clean.csv

Implements exactly what Part C.1 of the Phase 0 audit specified:
  1. Replace the "0" placeholder sentinel with real NaN in optional columns.
  2. Parse Location_Coordinates into latitude/longitude floats.
  3. Tokenize Specialties/Facilities (split on both "," and newlines).
  4. Derive emergency_flag from keyword search (Emergency_Services is
     non-null in only 2 of 30,273 source rows - documented, not hidden).
  5. Coerce Total_Num_Beds / Number_Doctor to numeric, "0"/blank -> NaN.
 
 
 
 
  6. Flag Name+Location duplicates instead of silently dropping them.

Run from the ml-service/ directory:
    python preprocessing/hospital_etl.py
"""

import json
import re
from pathlib import Path

import pandas as pd

RAW_PATH = Path(__file__).resolve().parents[2] / "data" / "raw" / "hospital" / "hospital_directory.csv"
OUT_PATH = Path(__file__).resolve().parents[2] / "data" / "processed" / "hospital" / "hospitals_clean.csv"

# Columns where "0" is a placeholder for "not provided", confirmed against
# the actual data during the Phase 0 audit (these are NOT numeric-zero fields).
PLACEHOLDER_ZERO_COLS = [
    "Hospital_Category", "Hospital_Care_Type", "Emergency_Services",
    "Specialties", "Facilities", "Website", "Accreditation",
    "Foreign_pcare", "Tollfree", "Helpline", "Ayush",
]

EMERGENCY_KEYWORDS = ["emergency", "casualty", "24 hour", "24 hours", "trauma"]


def split_multi_value(text):
    """Split a Specialties/Facilities cell on commas, pipes, and newlines,
    trim whitespace, drop empties, de-duplicate while preserving order."""
    if is_placeholder(text):
        return []
    parts = re.split(r"(?:\\[rn]|[\r\n,;|])+", str(text))
    seen = []
    for p in parts:
        cleaned = p.strip().strip(".")
        if cleaned and cleaned not in seen:
            seen.append(cleaned)
    return seen


def is_placeholder(value):
    if pd.isna(value):
        return True
    normalized = str(value).strip().lower()
    if normalized in {"", "nan", "none", "null", "na", "n/a", "not available"}:
        return True
    try:
        return float(normalized) == 0
    except ValueError:
        return False


def clean_text(value):
    if is_placeholder(value):
        return pd.NA
    return re.sub(r"(?:\\[rn]|[\r\n])+", " ", str(value)).strip()


def parse_coordinates(text):
    if pd.isna(text):
        return (None, None)
    try:
        lat_str, lon_str = str(text).split(",")
        return (float(lat_str.strip()), float(lon_str.strip()))
    except (ValueError, AttributeError):
        return (None, None)


def to_numeric_or_unknown(series):
    """'0' and blanks mean unknown for these count fields, not literal zero,
    per the audit (a hospital directory would not deliberately record 0 beds
    for an operating hospital in almost every row)."""
    coerced = pd.to_numeric(series, errors="coerce")
    coerced = coerced.where(coerced != 0, other=pd.NA)
    return coerced


def derive_emergency_flag(row):
    raw_value = row.get("Emergency_Services", "")
    if not is_placeholder(raw_value):
        return True, "raw"
    combined_text = f"{row.get('Facilities', '')} {row.get('Specialties', '')}".lower()
    if any(kw in combined_text for kw in EMERGENCY_KEYWORDS):
        return True, "derived"
    return False, "derived"


def run_etl():
    df = pd.read_csv(RAW_PATH, low_memory=False)
    original_rows = len(df)

    # Step 1: sentinel replacement
    for col in PLACEHOLDER_ZERO_COLS:
        if col in df.columns:
            df[col] = df[col].apply(lambda value: pd.NA if is_placeholder(value) else value)

    # Step 2: coordinates
    coords = df["Location_Coordinates"].apply(parse_coordinates)
    df["latitude"] = coords.apply(lambda t: t[0])
    df["longitude"] = coords.apply(lambda t: t[1])
    geocode_needed = df["latitude"].isna().sum()

    # Step 3: tokenize specialties/facilities
    df["specialties_list"] = df["Specialties"].apply(split_multi_value)
    df["facilities_list"] = df["Facilities"].apply(split_multi_value)

    # Step 4: emergency flag (documented raw vs derived)
    flags = df.apply(derive_emergency_flag, axis=1, result_type="expand")
    df["emergency_flag"] = flags[0]
    df["emergency_flag_source"] = flags[1]

    # Step 5: numeric coercion
    df["total_beds_clean"] = to_numeric_or_unknown(df["Total_Num_Beds"])
    df["number_doctors_clean"] = to_numeric_or_unknown(df["Number_Doctor"])

    # Step 6: duplicate flag (kept, not dropped)
    df["duplicate_flag"] = df.duplicated(subset=["Hospital_Name", "Location"], keep=False)

    # Build the clean output frame with clear column names
    clean = pd.DataFrame({
        "source_row_id": df["Sr_No"],
        "name": df["Hospital_Name"].apply(clean_text),
        "address": df["Address_Original_First_Line"].apply(clean_text),
        "location": df["Location"].apply(clean_text),
        "state": df["State"].apply(clean_text),
        "district": df["District"].apply(clean_text),
        "subdistrict": df["Subdistrict"].apply(clean_text),
        "town": df["Town"].apply(clean_text),
        "subtown": df["Subtown"].apply(clean_text),
        "village": df["Village"].apply(clean_text),
        "pincode": df["Pincode"].apply(clean_text),
        "telephone": df["Telephone"].apply(clean_text),
        "mobile_number": df["Mobile_Number"].apply(clean_text),
        "emergency_number": df["Emergency_Num"].apply(clean_text),
        "ambulance_phone": df["Ambulance_Phone_No"].apply(clean_text),
        "bloodbank_phone": df["Bloodbank_Phone_No"].apply(clean_text),
        "foreign_patient_care": df["Foreign_pcare"].apply(clean_text),
        "tollfree": df["Tollfree"].apply(clean_text),
        "helpline": df["Helpline"].apply(clean_text),
        "fax": df["Hospital_Fax"].apply(clean_text),
        "primary_email": df["Hospital_Primary_Email_Id"].apply(clean_text),
        "secondary_email": df["Hospital_Secondary_Email_Id"].apply(clean_text),
        "registration_number": df["Hospital_Regis_Number"].apply(clean_text),
        "registration_scan": df["Registeration_Number_Scan"].apply(clean_text),
        "nodal_person": df["Nodal_Person_Info"].apply(clean_text),
        "nodal_person_telephone": df["Nodal_Person_Tele"].apply(clean_text),
        "nodal_person_email": df["Nodal_Person_Email_Id"].apply(clean_text),
        "established_year": to_numeric_or_unknown(df["Establised_Year"]),
        "medicine_systems": df["Discipline_Systems_of_Medicine"].apply(split_multi_value).apply(json.dumps),
        "ayush_systems": df["Ayush"].apply(split_multi_value).apply(json.dumps),
        "miscellaneous_facilities": df["Miscellaneous_Facilities"].apply(split_multi_value).apply(json.dumps),
        "latitude": df["latitude"],
        "longitude": df["longitude"],
        "specialties": df["specialties_list"].apply(json.dumps),
        "facilities": df["facilities_list"].apply(json.dumps),
        "emergency_flag": df["emergency_flag"],
        "emergency_flag_source": df["emergency_flag_source"],
        "total_beds": df["total_beds_clean"],
        "number_doctors": df["number_doctors_clean"],
        "consultant_count": to_numeric_or_unknown(df["Num_Mediconsultant_or_Expert"]),
        "private_ward_count": to_numeric_or_unknown(df["Number_Private_Wards"]),
        "economically_weaker_beds": to_numeric_or_unknown(df["Num_Bed_for_Eco_Weaker_Sec"]),
        "empanelment": df["Empanelment_or_Collaboration_with"].apply(clean_text),
        "tariff_range": df["Tariff_Range"].apply(clean_text),
        "state_id": to_numeric_or_unknown(df["State_ID"]),
        "district_id": to_numeric_or_unknown(df["District_ID"]),
        "category": df["Hospital_Category"].apply(clean_text),
        "care_type": df["Hospital_Care_Type"].apply(clean_text),
        "accreditation": df["Accreditation"].apply(clean_text),
        "website": df["Website"].apply(clean_text),
        "duplicate_flag": df["duplicate_flag"],
    })

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    clean.to_csv(OUT_PATH, index=False)

    summary = {
        "input_rows": original_rows,
        "output_rows": len(clean),
        "rows_missing_coordinates_before_geocoding": int(geocode_needed),
        "rows_with_emergency_flag_true": int(df["emergency_flag"].sum()),
        "rows_with_emergency_flag_raw_source": int((df["emergency_flag_source"] == "raw").sum()),
        "duplicate_name_location_rows": int(df["duplicate_flag"].sum()),
        "output_path": str(OUT_PATH),
    }
    return summary


if __name__ == "__main__":
    result = run_etl()
    print(json.dumps(result, indent=2))
