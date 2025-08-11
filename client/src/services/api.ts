import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log("[DEBUG_LOG] API: Axios instance created with baseURL:", process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api');

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log("[DEBUG_LOG] API: Making request to:", config.url, "with params:", config.params);
    return config;
  },
  (error) => {
    console.error("[DEBUG_LOG] API: Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log("[DEBUG_LOG] API: Response received from:", response.config.url, "status:", response.status);
    console.log("[DEBUG_LOG] API: Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("[DEBUG_LOG] API: Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Stats API
export const getKpiData = async () => {
  const response = await api.get('/stats/kpi');
  return response.data;
};

export const getBgcClassesData = async () => {
  const response = await api.get('/stats/bgc-classes');
  return response.data;
};


// Browse API
export const getStudies = async (params = {}) => {
  const response = await api.get('/browse/studies', { params });
  return response.data;
};

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

export const getRuns = async (params = {}) => {
  const response = await api.get('/browse/runs', { params });
  return response.data;
};

export const getBiomes = async (params = {}) => {
  const response = await api.get('/browse/biomes', { params });
  return response.data;
};

export const getAssemblies = async (params = {}) => {
  const response = await api.get('/browse/assemblies', { params });
  return response.data;
};

export const getAnalyses = async (params = {}) => {
  const response = await api.get('/browse/analyses', { params });
  return response.data;
};

// Get filter options for dropdowns
export const getFilterOptions = async (table: string, column: string) => {
  const response = await api.get(`/browse/filter-options/${table}/${column}`);
  return response.data;
};

// Get multiple filter options in one request
export const getBatchFilterOptions = async (requests: Array<{table: string, column: string}>) => {
  const response = await api.post('/browse/filter-options/batch', { requests });
  return response.data;
};

export default api;
