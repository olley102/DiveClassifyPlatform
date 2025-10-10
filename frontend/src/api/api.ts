import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Automatically proxied to FastAPI
});

export default api;
