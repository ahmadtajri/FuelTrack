import React from 'react';

const CostAnalysis = ({ costAnalysis }) => {
  if (!costAnalysis) return null;

  const { fuelCostPerKm, incomePerKm, fuelCostRatio, totalFuelCost, litersUsed } = costAnalysis;

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-700 h-full">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-100 flex items-center">
        <span className="bg-purple-500/20 text-purple-400 p-2 rounded-lg mr-3">💸</span>
        Analisis Biaya Operasional
      </h3>
      
      <div className="space-y-4">
        <div className="bg-slate-900 rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="text-sm text-slate-400 mb-1">BBM Terpakai / Hari</div>
            <div className="text-xl font-bold text-slate-200">{litersUsed.toFixed(1)} Liter</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">Total Biaya BBM</div>
            <div className="text-xl font-bold text-red-400">{formatRp(totalFuelCost)}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-red-500">
            <div className="text-sm text-slate-400 mb-1">Cost per km</div>
            <div className="text-lg font-bold text-slate-200">{formatRp(fuelCostPerKm)}</div>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-green-500">
            <div className="text-sm text-slate-400 mb-1">Income per km</div>
            <div className="text-lg font-bold text-slate-200">{formatRp(incomePerKm)}</div>
          </div>
        </div>

        {fuelCostRatio > 0 && (
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex justify-between items-end mb-2">
              <div className="text-sm text-slate-400">Rasio Biaya BBM vs Pendapatan</div>
              <div className={`text-lg font-bold ${fuelCostRatio > 30 ? 'text-red-400' : 'text-green-400'}`}>
                {fuelCostRatio.toFixed(1)}%
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${fuelCostRatio > 30 ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${Math.min(fuelCostRatio, 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 text-right">
              *Idealnya di bawah 20-30%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostAnalysis;
