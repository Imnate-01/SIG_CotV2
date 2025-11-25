// src/services/api.ts
import axios from 'axios';

// Creamos una instancia básica de axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Tu URL del backend
});

// INTERCEPTOR: Esto se ejecuta antes de cada petición
api.interceptors.request.use((config) => {
  // 1. Buscamos el token en el localStorage
  const token = localStorage.getItem('auth_token');

  // 2. Si existe, lo agregamos al encabezado Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;