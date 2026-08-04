/**
 * Predict Route
 */

const { Router } = require('express');
const { z } = require('zod');
const { validate } = require('../middlewares/validate');
const { createPrediction } = require('../controllers/predict.controller');

const router = Router();

// Validation schema
const predictSchema = z.object({
  vehicleCategory: z.enum(['Roda2', 'Roda4']),
  vehicleType: z.enum(['Bebek', 'Matic', 'Sport', 'Sport Besar', 'City Car', 'MPV', 'SUV']),
  engineCc: z.number().min(50).max(2500),
  cylinders: z.number().int().min(1).max(6),
  horsepower: z.number().min(5).max(200),
  weightKg: z.number().min(50).max(2000),
  transmission: z.enum(['Manual', 'Automatic', 'CVT', 'DCT']),
  fuelType: z.enum(['Bensin', 'Diesel', 'Hybrid']),
  coolingSystem: z.enum(['Air-cooled', 'Liquid-cooled']).optional().default('Liquid-cooled'),
  dailyDistanceKm: z.number().min(1).max(500),
  dailyIncome: z.number().min(0).optional(),
  fuelPricePerLiter: z.number().min(0).optional(),
  year: z.number().int().min(2000).max(2030),
});

router.post('/', validate(predictSchema), createPrediction);

module.exports = router;
