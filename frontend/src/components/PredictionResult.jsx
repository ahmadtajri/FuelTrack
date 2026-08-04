import React from 'react';

const PredictionResult = ({ prediction }) => {
  if (!prediction) return null;

  const isHemat = prediction.label === 'Hemat';
  const color = isHemat ? 'from-green-500 to-emerald-700' : 'from-red-500 to-rose-700';
  const icon = isHemat ? '🟢' : '🔴';

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 text-center animate-fade-in">
      <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Hasil Prediksi</h3>
      
      <div className={`mt-4 mx-auto w-full max-w-sm rounded-2xl p-1 bg-gradient-to-r ${color}`}>
        <div className="bg-slate-900 rounded-xl py-6 px-4">
          <div className="text-5xl font-bold text-white mb-2">
            {prediction.predictedKmpl.toFixed(1)} <span className="text-xl text-slate-400">km/L</span>
          </div>
          <div className={`text-xl font-semibold mt-4 flex items-center justify-center gap-2 ${isHemat ? 'text-green-400' : 'text-red-400'}`}>
            <span>{icon}</span> {prediction.label.toUpperCase()}
          </div>
        </div>
      </div>
      
      <p className="text-slate-400 text-sm mt-6">
        *Berdasarkan model AI, batas efisiensi untuk jenis kendaraan ini adalah 
        <span className="text-slate-300 font-semibold mx-1">{prediction.threshold} km/L</span>.
      </p>
    </div>
  );
};

export default PredictionResult;
