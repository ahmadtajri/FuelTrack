/**
 * Analysis Service
 * Calculates operational costs, profit, and efficiency metrics.
 */

/**
 * Calculate operational cost metrics.
 * @param {number} kmpl - Predicted fuel efficiency (km/L)
 * @param {number} dailyDistanceKm - Daily distance traveled (km)
 * @param {number} fuelPricePerLiter - Fuel price per liter (Rp)
 * @param {number} dailyIncome - Daily gross income (Rp)
 */
function calculateOperationalCost(kmpl, dailyDistanceKm, fuelPricePerLiter, dailyIncome) {
  const litersUsed = dailyDistanceKm / kmpl;
  const totalFuelCost = litersUsed * fuelPricePerLiter;
  const fuelCostPerKm = fuelPricePerLiter / kmpl;
  const incomePerKm = dailyIncome > 0 ? dailyIncome / dailyDistanceKm : 0;
  const fuelCostRatio = dailyIncome > 0 ? (totalFuelCost / dailyIncome) * 100 : 0;

  return {
    litersUsed: Math.round(litersUsed * 100) / 100,
    totalFuelCost: Math.round(totalFuelCost),
    fuelCostPerKm: Math.round(fuelCostPerKm * 100) / 100,
    incomePerKm: Math.round(incomePerKm * 100) / 100,
    fuelCostRatio: Math.round(fuelCostRatio * 100) / 100,
  };
}

/**
 * Calculate daily profit metrics.
 * @param {number} dailyIncome - Daily gross income (Rp)
 * @param {number} totalFuelCost - Total daily fuel cost (Rp)
 */
function calculateDailyProfit(dailyIncome, totalFuelCost) {
  const dailyProfit = dailyIncome - totalFuelCost;
  const profitMargin = dailyIncome > 0 ? (dailyProfit / dailyIncome) * 100 : 0;

  return {
    dailyProfit: Math.round(dailyProfit),
    profitMargin: Math.round(profitMargin * 100) / 100,
  };
}

module.exports = {
  calculateOperationalCost,
  calculateDailyProfit,
};
