const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const docsCsv = path.resolve(__dirname, '../../../data/raw/doctor/verified_doctors.csv');
const content = fs.readFileSync(docsCsv, 'utf8');
const rows = parse(content, { columns: true, skip_empty_lines: true });

console.log('Total verified doctors in CSV:', rows.length);
const byHospital = {};
rows.forEach((r, i) => {
  const h = r['Hospital / Workplace'].trim();
  if (!byHospital[h]) byHospital[h] = [];
  byHospital[h].push({
    index: i + 1,
    name: r['Doctor Name'],
    specialty: r['Specialty'],
    state: r['State'],
    source: r['Source']
  });
});

for (const [hosp, list] of Object.entries(byHospital)) {
  console.log(`\n=== ${hosp} (${list[0].state}) - ${list.length} doctors ===`);
  list.forEach(d => console.log(`  ${d.name} | ${d.specialty} | ${d.source}`));
}
