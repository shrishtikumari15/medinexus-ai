const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const DATA_DIRECTORY = path.resolve(__dirname, '../../../data/raw/operational');
const DATASET_PATHS = [
  path.resolve(__dirname, '../../../medinexus_operational_dataset.csv'),
  path.join(DATA_DIRECTORY, 'medinexus_operational_dataset.csv'),
  path.join(DATA_DIRECTORY, 'operational_dataset.csv'),
];
const REQUIRED_COLUMNS = [
  'hospital_id',
  'day_of_week',
  'hour',
  'patient_arrivals',
  'doctors_available',
  'total_beds',
  'beds_available',
  'bed_occupancy',
  'queue_length',
  'doctor_utilization',
  'diagnostic_utilization',
  'hospital_load',
  'waiting_time_minutes',
];
const HOSPITAL_IDS = new Set(['H001', 'H002', 'H003', 'H004', 'H005']);
const RATIO_COLUMNS = ['bed_occupancy', 'doctor_utilization', 'diagnostic_utilization', 'hospital_load'];
const NON_NEGATIVE_COLUMNS = [
  'patient_arrivals',
  'doctors_available',
  'total_beds',
  'beds_available',
  'queue_length',
  'waiting_time_minutes',
];

let cachedDataset;

function datasetPath() {
  return DATASET_PATHS.find((candidate) => fs.existsSync(candidate));
}

function parseDataset() {
  const sourcePath = datasetPath();
  if (!sourcePath) {
    throw new Error(`Operational CSV was not found. Expected ${DATASET_PATHS.join(' or ')}.`);
  }
  const stat = fs.statSync(sourcePath);
  if (cachedDataset?.sourcePath === sourcePath && cachedDataset.modifiedAt === stat.mtimeMs) {
    return cachedDataset;
  }

  const rows = parse(fs.readFileSync(sourcePath, 'utf8'), {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  if (!rows.length) throw new Error(`Operational CSV contains no data rows: ${sourcePath}`);

  const missingColumns = REQUIRED_COLUMNS.filter((column) => !(column in rows[0]));
  if (missingColumns.length) {
    throw new Error(`Operational CSV is missing required columns: ${missingColumns.join(', ')}`);
  }

  let invalidRows = 0;
  let duplicateRows = 0;
  const seen = new Set();
  const validRows = [];

  rows.forEach((raw, index) => {
    if (!HOSPITAL_IDS.has(raw.hospital_id)) {
      invalidRows += 1;
      return;
    }

    const row = { hospital_id: raw.hospital_id };
    for (const column of REQUIRED_COLUMNS.slice(1)) {
      if (raw[column] === '' || raw[column] === undefined || !Number.isFinite(Number(raw[column]))) {
        invalidRows += 1;
        return;
      }
      row[column] = Number(raw[column]);
    }

    const valid =
      Number.isInteger(row.day_of_week) &&
      row.day_of_week >= 0 &&
      row.day_of_week <= 6 &&
      Number.isInteger(row.hour) &&
      row.hour >= 0 &&
      row.hour <= 23 &&
      NON_NEGATIVE_COLUMNS.every((column) => row[column] >= 0) &&
      row.total_beds > 0 &&
      row.beds_available <= row.total_beds &&
      RATIO_COLUMNS.every((column) => row[column] >= 0 && row[column] <= 1);
    if (!valid) {
      invalidRows += 1;
      return;
    }

    const signature = JSON.stringify(row);
    if (seen.has(signature)) {
      duplicateRows += 1;
      return;
    }
    seen.add(signature);
    validRows.push({ ...row, _sourceRow: index + 1 });
  });

  if (!validRows.length) throw new Error(`Operational CSV has no valid records: ${sourcePath}`);
  cachedDataset = {
    sourcePath,
    modifiedAt: stat.mtimeMs,
    rows: validRows,
    inputRows: rows.length,
    invalidRows,
    duplicateRows,
  };
  return cachedDataset;
}

function currentContext(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const dayOfWeek = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[values.weekday];
  return {
    dayOfWeek,
    hour: Number(values.hour),
  };
}

function normalizeContext(context = {}) {
  const fallback = currentContext();
  const dayOfWeek = context.dayOfWeek === undefined ? fallback.dayOfWeek : Number(context.dayOfWeek);
  const hour = context.hour === undefined ? fallback.hour : Number(context.hour);
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('day_of_week must be an integer from 0 to 6.');
  }
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error('hour must be an integer from 0 to 23.');
  }
  return { dayOfWeek, hour };
}

function selectOperationalRecord(hospitalId, context = {}) {
  const dataset = parseDataset();
  if (!HOSPITAL_IDS.has(hospitalId)) return null;
  const selected = normalizeContext(context);
  const selectedHourOfWeek = selected.dayOfWeek * 24 + selected.hour;
  const hospitalRows = dataset.rows.filter((row) => row.hospital_id === hospitalId);
  if (!hospitalRows.length) return null;

  const record = hospitalRows.reduce((closest, row) => {
    const rowHourOfWeek = row.day_of_week * 24 + row.hour;
    const rawDistance = Math.abs(rowHourOfWeek - selectedHourOfWeek);
    const distance = Math.min(rawDistance, 168 - rawDistance);
    if (!closest || distance < closest.distance || (distance === closest.distance && row._sourceRow > closest.row._sourceRow)) {
      return { row, distance };
    }
    return closest;
  }, null).row;

  const totalBeds = record.total_beds;
  const bedsAvailable = record.beds_available;
  return {
    hospitalId: record.hospital_id,
    dayOfWeek: record.day_of_week,
    hour: record.hour,
    patientArrivals: record.patient_arrivals,
    doctorsAvailable: record.doctors_available,
    totalBeds,
    bedsAvailable,
    occupiedBeds: totalBeds - bedsAvailable,
    bedAvailabilityPercentage: Math.round((bedsAvailable / totalBeds) * 100),
    bedOccupancy: record.bed_occupancy,
    queueLength: record.queue_length,
    doctorUtilization: record.doctor_utilization,
    diagnosticUtilization: record.diagnostic_utilization,
    hospitalLoad: record.hospital_load,
    waitingTimeMinutes: record.waiting_time_minutes,
    selectedFor: selected,
    sourceDataset: path.basename(dataset.sourcePath),
    dataType: 'synthetic_estimate',
    selectionPolicy: 'Nearest weekday/hour in the dataset; later CSV row used only to break equal-distance ties.',
    disclaimer: 'Operational metrics are estimates derived from the available operational dataset and should not be treated as real-time hospital availability.',
  };
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function getOperationalReference() {
  const dataset = parseDataset();
  return {
    totalBedsEstimate: Math.round(median(dataset.rows.map((row) => row.total_beds))),
    availableBedsEstimate: Math.round(median(dataset.rows.map((row) => row.beds_available))),
    waitingTimeEstimate: Math.round(median(dataset.rows.map((row) => row.waiting_time_minutes))),
    sourceDataset: path.basename(dataset.sourcePath),
    recordsUsed: dataset.rows.length,
    dataType: 'synthetic_dataset_reference',
    disclaimer: 'Synthetic dataset median; this estimate is not specific to this hospital and is not real-time availability.',
  };
}

function operationalBedAvailability(operationalData) {
  if (!operationalData) return null;
  return {
    totalBeds: operationalData.totalBeds,
    availableBeds: operationalData.bedsAvailable,
    occupiedBeds: operationalData.occupiedBeds,
    availabilityPercent: operationalData.bedAvailabilityPercentage,
    source: 'operational_dataset',
    sourceName: operationalData.sourceDataset,
    sourceUrl: null,
    updatedAt: null,
    isLive: false,
  };
}

function getDatasetSummary() {
  const dataset = parseDataset();
  return {
    sourceDataset: path.basename(dataset.sourcePath),
    inputRows: dataset.inputRows,
    validRows: dataset.rows.length,
    invalidRows: dataset.invalidRows,
    duplicateRows: dataset.duplicateRows,
    hospitalIds: [...new Set(dataset.rows.map((row) => row.hospital_id))].sort(),
  };
}

module.exports = {
  getDatasetSummary,
  getOperationalReference,
  operationalBedAvailability,
  selectOperationalRecord,
};
