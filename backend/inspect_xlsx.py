import pandas as pd

f = r'C:\Users\Shrishti kumari\OneDrive\Desktop\MediNexus_Official_Doctor_Dataset_Verified (1).xlsx'
df = pd.read_excel(f)
print(f"Total rows: {len(df)}")
for idx, row in df.iterrows():
    print(f"{idx+1}: {row['Doctor Name']} | {row['Specialty']} | {row['Hospital / Workplace']} | {row['State']}")
