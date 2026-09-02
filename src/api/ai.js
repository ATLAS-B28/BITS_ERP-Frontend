import axios from 'axios';

const aiApi = axios.create({
  baseURL: '/ai',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export const forecastApi = {
  getRevenueForecast: (periods = 30) =>
    aiApi.get(`/forecast/revenue?periods=${periods}`),

  getDemandForecast: (product = null, periods = 30) =>
    aiApi.get(`/forecast/demand?periods=${periods}${
      product ? `&product=${product}` : ''
    }`),

  getInventoryAnalytics: () =>
    aiApi.get('/forecast/inventory-analytics'),
};

export const chatApi = {
  sendMessage: (messages) =>
    aiApi.post('/chat/', { messages }),

  getSuggestions: () =>
    aiApi.get('/chat/suggestions'),
};