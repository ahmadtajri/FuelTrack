import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getTrend } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendChart = ({ currentPrediction }) => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setLoading(true);
        // If currentPrediction is available, we show trend for that specific vehicle type, else global
        const type = currentPrediction?.prediction?.vehicleType || '';
        const res = await getTrend(30, type);
        setTrendData(res.data);
      } catch (err) {
        console.error('Error fetching trend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [currentPrediction]);

  if (loading) return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 h-80 flex items-center justify-center">
      <div className="text-slate-400">Loading trend data...</div>
    </div>
  );

  if (trendData.length === 0) return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 h-80 flex flex-col items-center justify-center">
      <span className="text-4xl mb-3">📊</span>
      <div className="text-slate-400">Belum ada riwayat data</div>
    </div>
  );

  const data = {
    labels: trendData.map((d, i) => `Prediksi ${i+1}`), // Simple labels or use dates if available
    datasets: [
      {
        label: 'Efisiensi (km/L)',
        data: trendData.map(d => d.predictedKmpl),
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: trendData.map(d => d.label === 'Hemat' ? '#10b981' : '#f43f5e'),
        pointBorderColor: '#1e293b',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const item = trendData[index];
            return ` ${context.parsed.y.toFixed(1)} km/L (${item.label}) - ${item.vehicleType}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false,
        grid: { display: false }
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' }
      },
    },
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 h-full">
      <h3 className="text-xl font-semibold mb-6 text-slate-100 flex items-center">
        <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg mr-3">📈</span>
        Tren Historis Efisiensi
      </h3>
      <div className="h-48 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default TrendChart;
