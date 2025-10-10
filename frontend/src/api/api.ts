import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Automatically proxied to FastAPI
});

export default api;
