const Recommendation = require('../models/Recommendation');
const { combineWeightedScore, breakdownToComponents, DEFAULT_WEIGHTS } = require('../services/recommendationEngine');
const { withOperationalData } = require('./hospitalController');
const { getHospitalClinicalFaculty } = require('../services/clinicalFacultyProvider');

// GET /api/v1/recommendations/:id
// Returns the full ranked list with score breakdowns and explanation
// reasons - enriched with complete institutional profiles, operational metrics,
// and verified clinical faculty.
async function getRecommendationById(req, res, next) {
  try {
    const recommendation = await Recommendation.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('hospitalRankings.hospitalId', 'name description address location town subtown village district subdistrict pincode state stateId districtId website telephone mobileNumber emergencyNumber category careType accreditation totalBeds availableBeds occupiedBeds sourceRowId specialties facilities emergencyFlag emergencyFlagSource operationalHospitalId officialEnrichment geo')
      .populate('assessmentId', 'clinicalInputs dependentSnapshot dependentId createdAt requiredSpecialties requiredResources locationInput riskPrediction')
      .lean();
    if (!recommendation) {
      return res.status(404).json({ success: false, error: 'Recommendation not found' });
    }

    const reqSpecialty = recommendation.assessmentId?.requiredSpecialties?.[0] || '';

    if (Array.isArray(recommendation.hospitalRankings)) {
      recommendation.hospitalRankings = recommendation.hospitalRankings.map((ranking) => {
        if (!ranking.hospitalId || typeof ranking.hospitalId === 'string') return ranking;

        const enrichedHospital = withOperationalData(ranking.hospitalId);

        let opData = ranking.operationalData;
        if (!opData || !opData.available) {
          opData = enrichedHospital.operationalData;
        }

        let bedAvail = ranking.bedAvailability;
        if (!bedAvail || bedAvail.availableBeds === null || bedAvail.availableBeds === undefined) {
          bedAvail = enrichedHospital.bedAvailability;
        }

        let docs = ranking.doctors;
        if (!docs || docs.length === 0) {
          docs = getHospitalClinicalFaculty(enrichedHospital, reqSpecialty);
        }

        return {
          ...ranking,
          hospitalId: enrichedHospital,
          operationalData: opData,
          bedAvailability: bedAvail,
          doctors: docs,
        };
      });
    }

    return res.json({ success: true, data: recommendation });
  } catch (err) {
    return next(err);
  }
}

// POST /api/v1/recommendations/:id/sensitivity
// Body: { weightScenarios: [{ name: "Emphasize speed", weights: {...} }, ...] }
// Recomputes the total score for each hospital under each alternate weight
// set, reusing the STORED per-component breakdown - no re-query of hospital
// data or re-call to the ML service needed, so this is fast and always
// consistent with what the user originally saw. Satisfies the explicit
// "sensitivity analysis" requirement (Part 13) so different weight
// combinations can be compared without retraining or re-scoring from raw data.
async function runSensitivityAnalysis(req, res, next) {
  try {
    const { weightScenarios } = req.body;
    if (!Array.isArray(weightScenarios) || weightScenarios.length === 0) {
      return res.status(400).json({ success: false, error: 'weightScenarios must be a non-empty array' });
    }

    const recommendation = await Recommendation.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('hospitalRankings.hospitalId', 'name')
      .lean();
    if (!recommendation) {
      return res.status(404).json({ success: false, error: 'Recommendation not found' });
    }

    const baselineWeights = recommendation.scoreWeightsUsed || DEFAULT_WEIGHTS;

    const results = weightScenarios.map((scenario) => {
      const weights = { ...baselineWeights, ...(scenario.weights || {}) };
      const rescored = recommendation.hospitalRankings
        .map((ranking) => {
          const components = breakdownToComponents(ranking.breakdown);
          const { score } = combineWeightedScore(components, weights);
          return {
            hospitalId: ranking.hospitalId?._id || ranking.hospitalId,
            hospitalName: ranking.hospitalId?.name || 'Unknown',
            originalScore: ranking.score,
            scenarioScore: score,
            scoreDelta: score - ranking.score,
          };
        })
        .sort((a, b) => b.scenarioScore - a.scenarioScore);

      return { scenarioName: scenario.name || 'Unnamed scenario', weightsUsed: weights, rankings: rescored };
    });

    return res.json({
      success: true,
      data: {
        recommendationId: recommendation._id,
        baselineWeights,
        scenarios: results,
        note: 'This is a what-if comparison of scoring weights, not a re-prediction - underlying ML outputs and hospital data are unchanged.',
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getRecommendationById, runSensitivityAnalysis };
