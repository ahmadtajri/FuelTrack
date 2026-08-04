import React, { useState, useEffect } from 'react';
import axios from 'axios'; // We can just use the api instance directly but for base64 image fetching, let's use the options route

const ShapPlots = ({ prediction, optionsApiUrl }) => {
  const [summaryImage, setSummaryImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:3001/api/feature-options/shap-summary');
        if (res.data.image) {
          setSummaryImage(`data:image/png;base64,${res.data.image}`);
        }
      } catch (err) {
        console.error('Failed to load SHAP summary plot:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch global summary plot once
    if (!summaryImage && !loading) {
      fetchSummary();
    }
  }, []);

  if (!prediction) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 w-full col-span-full">
        <h3 className="text-xl font-semibold mb-6 text-slate-100 flex items-center">
          <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg mr-3">🧠</span>
          Interpretasi Model AI (SHAP)
        </h3>
        
        {loading ? (
          <div className="text-slate-400 text-center py-8">Loading SHAP Summary Plot...</div>
        ) : summaryImage ? (
          <div className="flex flex-col items-center">
            <h4 className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">
              Summary Plot (Faktor Global)
            </h4>
            <div className="bg-slate-900 rounded-lg p-4 max-w-4xl w-full border border-slate-700 flex justify-center">
              <img src={summaryImage} alt="SHAP Summary Plot" className="w-full max-w-2xl rounded" />
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-center py-8">
            Lakukan prediksi untuk melihat faktor-faktor yang mempengaruhi efisiensi kendaraan Anda.
          </div>
        )}
      </div>
    );
  }

  const { shapValues, baseValue, predictedKmpl } = prediction;

  // We are not using Force Plot image from backend for single prediction here to save request time, 
  // instead we show a custom breakdown using the shapValues array!
  
  return (
    <div className="bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-700 w-full">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-slate-100 flex items-center">
        <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg mr-3">🧠</span>
        Faktor Penentu Prediksi Anda
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Left: Waterfall / Bar breakdown custom UI */}
        <div>
          <h4 className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">
            Kontribusi Fitur Terbesar
          </h4>
          
          <div className="space-y-3">
            {shapValues?.slice(0, 7).map((feat, idx) => {
              const isPositive = feat.shap_value > 0;
              const barColor = isPositive ? 'bg-emerald-500' : 'bg-rose-500';
              const textColor = isPositive ? 'text-emerald-400' : 'text-rose-400';
              
              // Max width calculation for relative bars
              const maxAbs = Math.max(...shapValues.map(f => Math.abs(f.shap_value)));
              const width = Math.max(5, (Math.abs(feat.shap_value) / maxAbs) * 100);
              
              return (
                <div key={idx} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">{feat.label}</div>
                      <div className="text-sm font-semibold text-slate-200">
                        {typeof feat.value === 'number' && feat.value % 1 !== 0 ? feat.value.toFixed(1) : feat.value}
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${textColor}`}>
                      {isPositive ? '+' : ''}{feat.shap_value.toFixed(2)} km/L
                    </div>
                  </div>
                  
                  {/* Custom horizontal bar centered at 50% */}
                  <div className="relative h-1.5 w-full bg-slate-800 rounded-full flex items-center">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 z-10"></div>
                    <div 
                      className={`absolute h-1.5 rounded-full ${barColor}`} 
                      style={{ 
                        width: `${width/2}%`, 
                        left: isPositive ? '50%' : `${50 - (width/2)}%`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 bg-slate-900 rounded-lg p-3 border border-slate-700 flex justify-between">
            <span className="text-slate-400 text-sm">Base Value (Rata-rata Model):</span>
            <span className="text-slate-200 font-bold">{baseValue?.toFixed(2)} km/L</span>
          </div>
        </div>

        {/* Right: Global Summary Plot */}
        <div>
          <h4 className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">
            Summary Plot Global
          </h4>
          
          {loading ? (
            <div className="bg-slate-900 rounded-lg border border-slate-700 h-64 flex items-center justify-center">
              <span className="text-slate-400">Loading Plot...</span>
            </div>
          ) : summaryImage ? (
            <div className="bg-slate-900 rounded-lg p-2 border border-slate-700 h-full flex flex-col items-center justify-center">
              <img src={summaryImage} alt="SHAP Summary Plot" className="w-full h-auto rounded" />
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Menunjukkan fitur mana yang secara global paling berpengaruh terhadap boros/hematnya BBM.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-lg border border-slate-700 h-64 flex items-center justify-center">
              <span className="text-slate-500">Gagal memuat plot</span>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ShapPlots;
