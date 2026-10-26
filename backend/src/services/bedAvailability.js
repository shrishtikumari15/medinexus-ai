function getBedAvailability(hospital) {
  const totalBeds = Number.isFinite(hospital?.totalBeds) && hospital.totalBeds > 0
    ? hospital.totalBeds
    : null;
  const availableBeds = Number.isFinite(hospital?.availableBeds) && hospital.availableBeds >= 0
    ? hospital.availableBeds
    : null;
  const occupiedBeds = Number.isFinite(hospital?.occupiedBeds) && hospital.occupiedBeds >= 0
    ? hospital.occupiedBeds
    : null;
  const countsConflict = totalBeds !== null && (
    (availableBeds !== null && availableBeds > totalBeds) ||
    (occupiedBeds !== null && occupiedBeds > totalBeds) ||
    (availableBeds !== null && occupiedBeds !== null && availableBeds + occupiedBeds > totalBeds)
  );

  return {
    totalBeds,
    availableBeds: countsConflict ? null : availableBeds,
    occupiedBeds: countsConflict ? null : occupiedBeds,
    availabilityPercent: !countsConflict && totalBeds !== null && availableBeds !== null
      ? Math.round((availableBeds / totalBeds) * 100)
      : null,
    source: hospital?.bedDataSource || 'unknown',
    sourceName: hospital?.bedDataSourceName || null,
    sourceUrl: hospital?.bedDataSourceUrl || null,
    updatedAt: hospital?.bedDataUpdatedAt || null,
    isLive: false,
  };
}

module.exports = { getBedAvailability };