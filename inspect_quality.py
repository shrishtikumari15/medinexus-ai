import json
import os
import re
import pandas as pd
import numpy as np

# Load datasets
hospitals_clean_path = 'data/processed/hospital/hospitals_clean.csv'
hospitals_raw_path = 'data/raw/hospital/hospital_directory.csv'
verified_doctors_path = 'data/raw/doctor/verified_doctors.csv'
official_sources_path = 'data/raw/doctor/official_sources.csv'
operational_path = 'data/raw/operational/operational_dataset.csv'

print("=== INSPECTING DATASETS ===")
df_hosp = pd.read_csv(hospitals_clean_path, low_memory=False)
print(f"Hospital records (clean): {len(df_hosp)}")

df_docs = pd.read_csv(verified_doctors_path)
print(f"Doctor records (verified_doctors.csv): {len(df_docs)}")

df_op = pd.read_csv(operational_path)
print(f"Operational records: {len(df_op)}")

# 1. Number of hospital records
num_hosp_records = len(df_hosp)

# 2. Number of unique hospitals
# Check uniqueness by name, state, district/address, or source_row_id
unique_hosp_ids = df_hosp['source_row_id'].nunique()
unique_hosp_names = df_hosp['name'].nunique()
unique_hosp_name_state = df_hosp.groupby(['name', 'state']).ngroups

# 3. Number of doctor records
num_doctor_records = len(df_docs)

# 4. Number of unique doctors
unique_doctors = df_docs['Doctor Name'].nunique()

# 5. Number of specialties
# In hospitals:
hosp_specialties = set()
for s in df_hosp['specialties'].dropna():
    try:
        items = json.loads(s) if s.startswith('[') else [s]
        for item in items:
            if item.strip():
                hosp_specialties.add(item.strip())
    except:
        hosp_specialties.add(s.strip())

# In doctors:
doc_specialties = set()
for s in df_docs['Specialty'].dropna():
    for sub in re.split(r'[;&]', s):
        if sub.strip():
            doc_specialties.add(sub.strip())

# 6. Number of states
hosp_states = set(df_hosp['state'].dropna().unique())
doc_states = set(df_docs['State'].dropna().unique())
all_states = hosp_states.union(doc_states)

# 7. Number of cities/districts
hosp_districts = set(df_hosp['district'].dropna().unique())
hosp_towns = set(df_hosp['town'].dropna().unique())
doc_workplaces = df_docs['Hospital / Workplace'].dropna().tolist()

# 8. Number of verified doctor records
# In verified_doctors.csv:
verified_doc_count = len(df_docs) # all 67 in verified_doctors.csv have official directory sources
unverified_doc_count = 0

# 10. Missing values
missing_hosp = df_hosp[['name', 'state', 'district', 'town', 'address', 'total_beds', 'specialties', 'website']].isnull().sum().to_dict()
missing_docs = df_docs.isnull().sum().to_dict()

# 11. Duplicate records
dup_hosp_source_id = df_hosp['source_row_id'].duplicated().sum()
dup_hosp_name_loc = df_hosp.duplicated(subset=['name', 'state', 'district', 'address']).sum()
dup_docs = df_docs.duplicated(subset=['Doctor Name', 'Hospital / Workplace', 'Specialty']).sum()

print("\n--- Summary Metrics ---")
print(f"1. Hospital records: {num_hosp_records}")
print(f"2. Unique hospitals (source_row_id: {unique_hosp_ids}, unique names: {unique_hosp_names}, name+state: {unique_hosp_name_state})")
print(f"3. Doctor records: {num_doctor_records}")
print(f"4. Unique doctors: {unique_doctors}")
print(f"5. Hospital specialties: {len(hosp_specialties)}, Doctor specialties: {len(doc_specialties)}")
print(f"6. States in hospitals: {len(hosp_states)}, States in doctors: {len(doc_states)}")
print(f"7. Hospital districts: {len(hosp_districts)}, towns: {len(hosp_towns)}")
print(f"8. Verified doctor records: {verified_doc_count}")
print(f"9. Unverified records: {unverified_doc_count}")
print(f"10. Missing values in hospitals:\n{json.dumps(missing_hosp, indent=2)}")
print(f"10. Missing values in doctors:\n{json.dumps(missing_docs, indent=2)}")
print(f"11. Duplicates: hosp source_id={dup_hosp_source_id}, hosp name+loc={dup_hosp_name_loc}, docs={dup_docs}")

# 12 & 13. Hospital names matching between datasets
print("\n--- Doctor Hospital matching ---")
for idx, row in df_docs.iterrows():
    doc_name = row['Doctor Name']
    spec = row['Specialty']
    hosp_workplace = row['Hospital / Workplace']
    doc_state = row['State']
    source = row['Source']
    
    # Try finding in df_hosp
    clean_hosp = hosp_workplace.replace('"', '').strip()
    # search name
    matches = df_hosp[df_hosp['name'].str.contains(re.escape(clean_hosp[:20]), case=False, na=False)]
    if len(matches) == 0:
        # try parts
        parts = clean_hosp.split(',')
        main_name = parts[0].strip()
        matches = df_hosp[df_hosp['name'].str.contains(re.escape(main_name), case=False, na=False)]
    
    # print sample
    if idx < 10:
        print(f"Doctor: {doc_name} | Workplace: '{hosp_workplace}' | Matched hospitals in directory: {len(matches)}")
