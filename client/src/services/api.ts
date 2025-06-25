import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stats API
export const getKpiData = async () => {
  const response = await api.get('/stats/kpi');
  return response.data;
};

export const getBgcClassesData = async () => {
  const response = await api.get('/stats/bgc-classes');
  return response.data;
};

export const getGrowthData = async () => {
  const response = await api.get('/stats/growth');
  return response.data;
};

// Browse API
export const getBgcs = async (params = {}) => {
  const response = await api.get('/browse/bgcs', { params });
  return response.data;
};

export const getGcfs = async (params = {}) => {
  const response = await api.get('/browse/gcfs', { params });
  return response.data;
};

export const getSamples = async (params = {}) => {
  const response = await api.get('/browse/samples', { params });
  return response.data;
};

export const getTaxonomy = async (params = {}) => {
  const response = await api.get('/browse/taxonomy', { params });
  return response.data;
};

export default api;