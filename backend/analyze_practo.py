import pandas as pd
import re

df = pd.read_csv(r'C:\Users\Shrishti kumari\OneDrive\Desktop\doctor_dataset\doctors.csv')
print("Total rows:", len(df))
print(df.info())

# Inspect qualifications
print("\nTop 15 Qualifications:")
print(df['Qualification'].value_counts().head(15))

# Inspect experience
print("\nExperience stats:")
print(df['Experience_in_years'].describe())

# Extract specialties from URL
def get_spec(url):
    if not isinstance(url, str):
        return 'General Medicine'
    m = re.search(r'/doctor/[^?]+', url)
    if not m:
        return 'General Medicine'
    slug = m.group(0)
    # common patterns in slug
    parts = slug.split('-')
    # look at trailing tokens
    return '-'.join(parts[-2:])

df['spec_hint'] = df['Website'].apply(get_spec)
print("\nSample spec hints from URLs:")
print(df[['Name', 'Qualification', 'Experience_in_years', 'spec_hint']].head(20))
