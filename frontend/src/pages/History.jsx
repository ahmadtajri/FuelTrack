import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/api';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async (p = 1) => {
    try {
      setLoading(true);
      const res = await getHistory(p, 10);
      setHistory(res.data);
      setTotalPages(res.pagination.totalPages);
      setPage(res.pagination.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Riwayat Prediksi</h1>
          <p className="text-slate-400 text-sm">Daftar semua prediksi efisiensi BBM yang pernah dilakukan</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium">Waktu</th>
                <th className="px-6 py-4 font-medium">Kendaraan</th>
                <th className="px-6 py-4 font-medium">Spesifikasi</th>
                <th className="px-6 py-4 font-medium">Hasil (km/L)</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Belum ada riwayat prediksi.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{item.vehicleType}</div>
                      <div className="text-xs text-slate-500">{item.vehicleCategory}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{item.engineCc}cc, {item.horsepower}HP</div>
                      <div className="text-xs text-slate-500">{item.transmission} • {item.fuelType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-200">{item.predictedKmpl.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.label === 'Hemat' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.label}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700 flex justify-between items-center">
            <span className="text-sm text-slate-400">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => fetchHistory(page - 1)}
                className="px-3 py-1 rounded bg-slate-800 border border-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => fetchHistory(page + 1)}
                className="px-3 py-1 rounded bg-slate-800 border border-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
