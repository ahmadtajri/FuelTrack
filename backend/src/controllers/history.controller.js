/**
 * History Controller
 * Handles retrieval of prediction history from database.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/history
 * Query params: page (default 1), limit (default 20), vehicleType (optional filter)
 */
async function getHistory(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const vehicleType = req.query.vehicleType || undefined;

    const where = vehicleType ? { vehicleType } : {};

    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.prediction.count({ where }),
    ]);

    res.json({
      data: predictions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/trend
 * Returns trend data for Chart.js line chart (consumption over time).
 * Query params: limit (default 50), vehicleType (optional filter)
 */
async function getTrend(req, res, next) {
  try {
    const limit = Math.min(200, Math.max(5, parseInt(req.query.limit) || 50));
    const vehicleType = req.query.vehicleType || undefined;

    const where = vehicleType ? { vehicleType } : {};

    const predictions = await prisma.prediction.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        predictedKmpl: true,
        label: true,
        vehicleType: true,
        createdAt: true,
        fuelCostPerKm: true,
      },
    });

    res.json({ data: predictions });
  } catch (error) {
    next(error);
  }
}

module.exports = { getHistory, getTrend };
