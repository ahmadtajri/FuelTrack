import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProfitChart = ({ profitAnalysis, dailyIncome }) => {
  if (!profitAnalysis || !dailyIncome) return null;

  const { dailyProfit, profitMargin } = profitAnalysis;
  const fuelCost = dailyIncome - dailyProfit;

  const data = {
    labels: ['Keuangan Harian'],
    datasets: [
      {
        label: 'Biaya BBM (Rp)',
        data: [fuelCost],
        backgroundColor: 'rgba(244, 63, 94, 0.8)', // rose-500
        borderColor: 'rgb(225, 29, 72)',
        borderWidth: 1,
      },
      {
        label: 'Keuntungan Bersih (Rp)',
        data: [dailyProfit],
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // emerald-500
        borderColor: 'rgb(5, 150, 105)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5e1', // slate-300
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      },
      y: {
        stacked: true,
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' } // slate-700
      },
    },
  };

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-700 h-full">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-100 flex items-center">
        <span className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg mr-3">📈</span>
        Analisis Keuntungan Harian
      </h3>
      
      <div className="h-40 sm:h-48 mb-4">
        <Bar data={data} options={options} />
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <div className="text-center bg-slate-900 rounded-lg p-3 border border-slate-700">
          <div className="text-xs text-slate-400">Profit Harian</div>
          <div className="text-lg font-bold text-emerald-400">{formatRp(dailyProfit)}</div>
        </div>
        <div className="text-center bg-slate-900 rounded-lg p-3 border border-slate-700">
          <div className="text-xs text-slate-400">Margin Keuntungan</div>
          <div className="text-lg font-bold text-slate-200">{profitMargin.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

export default ProfitChart;
