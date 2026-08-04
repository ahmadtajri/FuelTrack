import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export const getFeatureOptions = async () => {
  const response = await api.get('/feature-options');
  return response.data;
};

export const predictEfficiency = async (data) => {
  const response = await api.post('/predict', data);
  return response.data;
};

export const getHistory = async (page = 1, limit = 20, vehicleType = '') => {
  const params = { page, limit };
  if (vehicleType) params.vehicleType = vehicleType;
  const response = await api.get('/history', { params });
  return response.data;
};

export const getTrend = async (limit = 50, vehicleType = '') => {
  const params = { limit };
  if (vehicleType) params.vehicleType = vehicleType;
  const response = await api.get('/history/trend', { params });
  return response.data;
};
