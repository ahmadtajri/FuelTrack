/**
 * ML Service Client
 * Communicates with the Python FastAPI ML microservice.
 */

const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Call ML service to predict fuel efficiency + SHAP values.
 */
async function predict(inputData) {
  const payload = {
    vehicle_category: inputData.vehicleCategory,
    vehicle_type: inputData.vehicleType,
    engine_cc: inputData.engineCc,
    cylinders: inputData.cylinders,
    horsepower: inputData.horsepower,
    weight_kg: inputData.weightKg,
    transmission: inputData.transmission,
    fuel_type: inputData.fuelType,
    cooling_system: inputData.coolingSystem || 'Liquid-cooled',
    daily_distance_km: inputData.dailyDistanceKm,
    year: inputData.year,
  };

  const response = await mlClient.post('/internal/predict', payload);
  return response.data;
}

/**
 * Get population average fuel efficiency.
 */
async function getPopulationAverage(vehicleType) {
  const params = vehicleType ? { vehicle_type: vehicleType } : {};
  const response = await mlClient.get('/internal/population-avg', { params });
  return response.data;
}

/**
 * Get SHAP summary plot (global).
 */
async function getShapSummary() {
  const response = await mlClient.get('/internal/shap-summary');
  return response.data;
}

/**
 * Check ML service health.
 */
async function checkHealth() {
  const response = await mlClient.get('/internal/health');
  return response.data;
}

module.exports = {
  predict,
  getPopulationAverage,
  getShapSummary,
  checkHealth,
};
