import axios from 'axios';

// Definimos la URL base de forma dinámica
// Si existe la variable de entorno (en Vercel), usa esa.
// Si no existe (en tu PC), usa localhost:3001.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  // OJO: Aquí concatenamos '/api' al final de la URL base
  baseURL: `${API_URL}/api`, 
});

// INTERCEPTOR (Déjalo igual, está perfecto)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
