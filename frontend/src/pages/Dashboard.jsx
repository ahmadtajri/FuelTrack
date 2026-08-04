import React, { useState, useEffect } from 'react';
import VehicleForm from '../components/VehicleForm';
import PredictionResult from '../components/PredictionResult';
import EfficiencyGauge from '../components/EfficiencyGauge';
import CostAnalysis from '../components/CostAnalysis';
import ProfitChart from '../components/ProfitChart';
import ShapPlots from '../components/ShapPlots';
import TrendChart from '../components/TrendChart';
import { getFeatureOptions, predictEfficiency } from '../services/api';

const Dashboard = () => {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Initial load
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await getFeatureOptions();
        setOptions(data);
      } catch (err) {
        setError('Gagal memuat konfigurasi kendaraan. Pastikan server backend dan ML service berjalan.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handlePredict = async (formData) => {
    try {
      setPredicting(true);
      setError('');
      const data = await predictEfficiency(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat memprediksi efisiensi.');
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-lg sm:text-xl text-slate-400 flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 sm:h-6 sm:w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Memuat sistem AI...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      
      {/* Header Info */}
      <div className="bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
          Dashboard Prediksi Efisiensi BBM
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Masukkan spesifikasi kendaraan dan data operasional harian Anda. Sistem AI (XGBoost) akan memprediksi efisiensi BBM (km/L) 
          dan memberikan analisis biaya operasional secara instan.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500 text-rose-400 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm sm:text-base">
          ⚠️ {error}
        </div>
      )}

      {/* Main Grid — single column on mobile, 12-col on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <VehicleForm options={options} onSubmit={handlePredict} isLoading={predicting} />
        </div>
        
        {/* Right Column: Results & Charts */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Top Row: Prediction & Gauge — stack on small screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <PredictionResult prediction={result?.prediction} />
            <EfficiencyGauge prediction={result?.prediction} populationAvg={result?.populationAverage} />
          </div>
          
          {/* Middle Row: Cost & Profit */}
          {result?.costAnalysis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <CostAnalysis costAnalysis={result?.costAnalysis} />
              <ProfitChart profitAnalysis={result?.profitAnalysis} dailyIncome={result?.prediction?.dailyIncome} />
            </div>
          )}

          {/* Bottom Row: SHAP & Trend — always full-width */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <ShapPlots prediction={result} />
            <TrendChart currentPrediction={result} />
          </div>
          
          {/* Empty State */}
          {!result && !predicting && (
            <div className="bg-slate-800/50 rounded-xl p-8 sm:p-12 border border-slate-700/50 border-dashed text-center flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 opacity-50">🤖</span>
              <h3 className="text-lg sm:text-xl text-slate-300 font-medium mb-2">Menunggu Data Kendaraan</h3>
              <p className="text-slate-500 max-w-md text-sm sm:text-base">
                Isi form untuk melihat hasil prediksi efisiensi, analisis biaya, dan insight AI (SHAP) untuk kendaraan Anda.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
