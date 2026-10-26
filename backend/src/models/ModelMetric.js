const mongoose = require('mongoose');

const modelMetricSchema = new mongoose.Schema(
  {
    modelName: { type: String, required: true }, // "random_forest" | "lightgbm" | "xgboost_waiting_time"
    modelVersion: { type: String, required: true },
    taskType: { type: String, enum: ['classification', 'regression'], required: true },
    metrics: { type: mongoose.Schema.Types.Mixed, required: true }, // accuracy/precision/recall/f1 or MAE/RMSE/R2
    features: [{ type: String }],
    datasetSize: { type: Number, required: true },
    datasetDescription: { type: String, required: true }, // must state real vs synthetic, sample size
    trainedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ModelMetric', modelMetricSchema);
