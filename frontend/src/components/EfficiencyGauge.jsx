import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const EfficiencyGauge = ({ prediction, populationAvg }) => {
  if (!prediction || !populationAvg) return null;

  const userEfficiency = prediction.predictedKmpl;
  const avgEfficiency = populationAvg.selected_type_avg || populationAvg.overall;
  
  // Calculate percentage difference
  const diffPercent = ((userEfficiency - avgEfficiency) / avgEfficiency) * 100;
  const isBetter = userEfficiency >= avgEfficiency;
  
  // Determine color based on threshold (boros/hemat)
  const isHemat = prediction.label === 'Hemat';
  const colorHex = isHemat ? '#10b981' : '#f43f5e'; // emerald vs rose

  // Create gauge data
  const data = {
    labels: ['Efisiensi Anda', 'Sisa'],
    datasets: [
      {
        data: [userEfficiency, Math.max(0, (avgEfficiency * 1.5) - userEfficiency)],
        backgroundColor: [
          colorHex,
          '#1e293b', // slate-800
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: '80%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-700 relative overflow-hidden flex flex-col items-center justify-center h-full">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-slate-100 flex items-center w-full">
        <span className="bg-amber-500/20 text-amber-400 p-2 rounded-lg mr-3">⏱️</span>
        Efisiensi vs Rata-rata
      </h3>
      
      <div className="relative w-full h-40 flex items-end justify-center mb-6">
        <Doughnut data={data} options={options} />
        <div className="absolute flex flex-col items-center bottom-2">
          <span className="text-3xl font-bold text-slate-100">{userEfficiency.toFixed(1)}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">km/L</span>
        </div>
      </div>
      
      <div className="bg-slate-900 w-full p-4 rounded-lg text-center">
        <div className="text-sm text-slate-400 mb-1">
          Rata-rata {populationAvg.selected_type_avg ? 'Tipe Ini' : 'Keseluruhan'}: <span className="font-semibold text-slate-200">{avgEfficiency.toFixed(1)} km/L</span>
        </div>
        <div className={`text-sm font-medium ${isBetter ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isBetter ? '▲' : '▼'} {Math.abs(diffPercent).toFixed(1)}% {isBetter ? 'Lebih Irit' : 'Lebih Boros'} dari rata-rata
        </div>
      </div>
    </div>
  );
};

export default EfficiencyGauge;
