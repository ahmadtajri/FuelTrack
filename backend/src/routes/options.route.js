/**
 * Options Route
 * Returns valid dropdown values for the vehicle form.
 */

const { Router } = require('express');
const mlService = require('../services/mlService');

const router = Router();

const FEATURE_OPTIONS = {
  vehicleCategories: ['Roda2', 'Roda4'],
  vehicleTypes: {
    Roda2: ['Bebek', 'Matic', 'Sport', 'Sport Besar'],
    Roda4: ['City Car', 'MPV', 'SUV'],
  },
  transmissions: {
    Roda2: {
      Bebek: ['Manual'],
      Matic: ['CVT'],
      Sport: ['Manual'],
      'Sport Besar': ['Manual'],
    },
    Roda4: {
      'City Car': ['Manual', 'Automatic', 'CVT'],
      MPV: ['Manual', 'Automatic', 'CVT'],
      SUV: ['Manual', 'Automatic', 'CVT', 'DCT'],
    },
  },
  fuelTypes: {
    Roda2: ['Bensin'],
    Roda4: {
      'City Car': ['Bensin'],
      MPV: ['Bensin', 'Diesel'],
      SUV: ['Bensin', 'Diesel', 'Hybrid'],
    },
  },
  coolingSystems: {
    Roda2: {
      Bebek: ['Air-cooled'],
      Matic: ['Air-cooled', 'Liquid-cooled'],
      Sport: ['Liquid-cooled'],
      'Sport Besar': ['Liquid-cooled'],
    },
    Roda4: ['Liquid-cooled'],
  },
  ranges: {
    Bebek: { engineCc: [100, 150], cylinders: [1, 1], horsepower: [7, 12], weightKg: [90, 110] },
    Matic: { engineCc: [110, 160], cylinders: [1, 1], horsepower: [9, 16], weightKg: [95, 125] },
    Sport: { engineCc: [150, 250], cylinders: [1, 2], horsepower: [15, 30], weightKg: [120, 170] },
    'Sport Besar': { engineCc: [250, 650], cylinders: [2, 4], horsepower: [25, 70], weightKg: [160, 250] },
    'City Car': { engineCc: [1000, 1500], cylinders: [3, 4], horsepower: [65, 105], weightKg: [800, 1100] },
    MPV: { engineCc: [1300, 1800], cylinders: [4, 4], horsepower: [85, 130], weightKg: [1100, 1500] },
    SUV: { engineCc: [1500, 2000], cylinders: [4, 4], horsepower: [100, 150], weightKg: [1200, 1600] },
  },
  fuelPrices: {
    Bensin: { min: 10000, max: 13900, default: 10000 },
    Diesel: { min: 6800, max: 13200, default: 6800 },
    Hybrid: { min: 13900, max: 14500, default: 13900 },
  },
};

router.get('/', (req, res) => {
  res.json(FEATURE_OPTIONS);
});

router.get('/population-avg', async (req, res, next) => {
  try {
    const result = await mlService.getPopulationAverage(req.query.vehicleType);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/shap-summary', async (req, res, next) => {
  try {
    const result = await mlService.getShapSummary();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
