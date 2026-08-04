/**
 * Predict Controller
 * Handles prediction requests: calls ML service, computes analysis, saves to DB.
 */

const { PrismaClient } = require('@prisma/client');
const mlService = require('../services/mlService');
const { calculateOperationalCost, calculateDailyProfit } = require('../services/analysisService');

const prisma = new PrismaClient();

/**
 * POST /api/predict
 */
async function createPrediction(req, res, next) {
  try {
    const input = req.body;

    // 1. Call ML service for prediction + SHAP
    const mlResult = await mlService.predict(input);

    // 2. Calculate operational costs (if income & fuel price provided)
    let costAnalysis = null;
    let profitAnalysis = null;

    if (input.dailyIncome && input.fuelPricePerLiter && mlResult.predicted_kmpl > 0) {
      costAnalysis = calculateOperationalCost(
        mlResult.predicted_kmpl,
        input.dailyDistanceKm,
        input.fuelPricePerLiter,
        input.dailyIncome
      );

      profitAnalysis = calculateDailyProfit(
        input.dailyIncome,
        costAnalysis.totalFuelCost
      );
    }

    // 3. Get population average for this vehicle type
    const populationAvg = await mlService.getPopulationAverage(input.vehicleType);

    // 4. Save to database
    const prediction = await prisma.prediction.create({
      data: {
        vehicleCategory: input.vehicleCategory,
        vehicleType: input.vehicleType,
        engineCc: input.engineCc,
        cylinders: input.cylinders,
        horsepower: input.horsepower,
        weightKg: input.weightKg,
        transmission: input.transmission,
        fuelType: input.fuelType,
        coolingSystem: input.coolingSystem || null,
        dailyDistanceKm: input.dailyDistanceKm,
        dailyIncome: input.dailyIncome || null,
        fuelPricePerLiter: input.fuelPricePerLiter || null,
        year: input.year,
        predictedKmpl: mlResult.predicted_kmpl,
        label: mlResult.label,
        threshold: mlResult.threshold,
        fuelCostPerKm: costAnalysis?.fuelCostPerKm || null,
        incomePerKm: costAnalysis?.incomePerKm || null,
        fuelCostRatio: costAnalysis?.fuelCostRatio || null,
        dailyProfit: profitAnalysis?.dailyProfit || null,
        shapValues: mlResult.shap_values,
        baseValue: mlResult.base_value,
      },
    });

    // 5. Return combined result
    res.status(201).json({
      id: prediction.id,
      prediction: {
        predictedKmpl: mlResult.predicted_kmpl,
        label: mlResult.label,
        threshold: mlResult.threshold,
      },
      costAnalysis,
      profitAnalysis,
      populationAverage: populationAvg,
      shapValues: mlResult.shap_values,
      baseValue: mlResult.base_value,
      createdAt: prediction.createdAt,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createPrediction };
