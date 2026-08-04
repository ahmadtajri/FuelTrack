import React, { useState, useEffect } from 'react';

const getFuelTypes = (options, category, vehicleType) => {
  const categoryFuels = options?.fuelTypes?.[category];
  if (!categoryFuels) return ['Bensin'];
  if (Array.isArray(categoryFuels)) return categoryFuels;
  return categoryFuels[vehicleType] || categoryFuels[Object.keys(categoryFuels)[0]] || ['Bensin'];
};

const getCoolingSystems = (options, category, vehicleType) => {
  const categoryCooling = options?.coolingSystems?.[category];
  if (!categoryCooling) return ['Liquid-cooled'];
  if (Array.isArray(categoryCooling)) return categoryCooling;
  return categoryCooling[vehicleType] || categoryCooling[Object.keys(categoryCooling)[0]] || ['Liquid-cooled'];
};

const getTransmissions = (options, category, vehicleType) => {
  const categoryTransmissions = options?.transmissions?.[category];
  if (!categoryTransmissions) return ['Manual'];
  return categoryTransmissions[vehicleType] || categoryTransmissions[Object.keys(categoryTransmissions)[0]] || ['Manual'];
};

const VehicleForm = ({ options, onSubmit, isLoading }) => {
  const [category, setCategory] = useState('Roda2');
  const [formData, setFormData] = useState({
    vehicleCategory: 'Roda2',
    vehicleType: 'Matic',
    engineCc: 150,
    cylinders: 1,
    horsepower: 15,
    weightKg: 110,
    transmission: 'CVT',
    fuelType: 'Bensin',
    coolingSystem: 'Air-cooled',
    dailyDistanceKm: 30,
    dailyIncome: 100000,
    fuelPricePerLiter: 10000,
    year: 2024,
  });

  const applyCategoryDefaults = (newCategory) => {
    if (!options) return;
    const types = options.vehicleTypes[newCategory];
    const defaultType = types[0];

    setFormData(prev => ({
      ...prev,
      vehicleCategory: newCategory,
      vehicleType: defaultType,
      transmission: getTransmissions(options, newCategory, defaultType)[0],
      fuelType: getFuelTypes(options, newCategory, defaultType)[0],
      coolingSystem: getCoolingSystems(options, newCategory, defaultType)[0],
      engineCc: options.ranges[defaultType].engineCc[0],
      cylinders: options.ranges[defaultType].cylinders[0],
      horsepower: options.ranges[defaultType].horsepower[0],
      weightKg: options.ranges[defaultType].weightKg[0],
    }));
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    applyCategoryDefaults(newCategory);
  };

  // Reset fields when type changes
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      vehicleType: newType,
      transmission: getTransmissions(options, category, newType)[0],
      fuelType: getFuelTypes(options, category, newType)[0],
      coolingSystem: getCoolingSystems(options, category, newType)[0],
      engineCc: options.ranges[newType].engineCc[0],
      cylinders: options.ranges[newType].cylinders[0],
      horsepower: options.ranges[newType].horsepower[0],
      weightKg: options.ranges[newType].weightKg[0],
    }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      engineCc: Number(formData.engineCc),
      cylinders: Number(formData.cylinders),
      horsepower: Number(formData.horsepower),
      weightKg: Number(formData.weightKg),
      dailyDistanceKm: Number(formData.dailyDistanceKm),
      dailyIncome: formData.dailyIncome === '' ? undefined : Number(formData.dailyIncome),
      fuelPricePerLiter: formData.fuelPricePerLiter === '' ? undefined : Number(formData.fuelPricePerLiter),
      year: Number(formData.year),
    });
  };

  if (!options) return <div className="text-slate-400">Loading options...</div>;

  return (
    <div className="bg-slate-800 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-700">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center text-slate-100">
        <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg mr-3">🚘</span>
        Spesifikasi Kendaraan
      </h2>

      <div className="flex bg-slate-900 rounded-lg p-1 mb-4 sm:mb-6">
        <button
          type="button"
          onClick={() => handleCategoryChange('Roda2')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            category === 'Roda2' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🏍️ Roda 2 (Motor)
        </button>
        <button
          type="button"
          onClick={() => handleCategoryChange('Roda4')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            category === 'Roda4' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🚗 Roda 4 (Mobil)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Type & Transmission */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Jenis Kendaraan</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleTypeChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {options.vehicleTypes[category]?.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Transmisi</label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {getTransmissions(options, category, formData.vehicleType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Engine Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Kapasitas Mesin (CC)
            </label>
            <input
              type="number"
              name="engineCc"
              value={formData.engineCc}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">Range: {options.ranges[formData.vehicleType]?.engineCc.join('-')}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Tenaga (HP)
            </label>
            <input
              type="number"
              name="horsepower"
              value={formData.horsepower}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">Range: {options.ranges[formData.vehicleType]?.horsepower.join('-')}</p>
          </div>
        </div>

        {/* Physical Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Berat (kg)
            </label>
            <input
              type="number"
              name="weightKg"
              value={formData.weightKg}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Silinder
            </label>
            <input
              type="number"
              name="cylinders"
              value={formData.cylinders}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Fuel & Cooling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Bahan Bakar</label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {getFuelTypes(options, category, formData.vehicleType).map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          {category === 'Roda2' ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Pendingin</label>
              <select
                name="coolingSystem"
                value={formData.coolingSystem}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {getCoolingSystems(options, category, formData.vehicleType).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tahun Kendaraan</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
        </div>
        
        {/* Operational Specs (Cost Analysis) */}
        <div className="border-t border-slate-700 pt-4 mt-2">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
            <span className="text-green-400 mr-2">💰</span> Data Operasional (Opsional)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Jarak Harian (km)
              </label>
              <input
                type="number"
                name="dailyDistanceKm"
                value={formData.dailyDistanceKm}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Harga BBM (Rp/Liter)
              </label>
              <input
                type="number"
                name="fuelPricePerLiter"
                value={formData.fuelPricePerLiter}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Pendapatan Kotor Harian (Rp) <span className="text-slate-500 text-[10px]">(Kosongkan jika bukan komersial)</span>
            </label>
            <input
              type="number"
              name="dailyIncome"
              value={formData.dailyIncome}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Menganalisis...' : 'Mulai Analisis Efisiensi'}
        </button>
      </form>
    </div>
  );
};

export default VehicleForm;
