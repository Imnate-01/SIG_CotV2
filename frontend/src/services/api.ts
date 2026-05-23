import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// ── Interceptor de REQUEST: adjunta el access_token a cada petición ──────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ── Interceptor de RESPONSE: auto-refresh silencioso al recibir 401 ──────────
// Flujo:
//  1. Petición falla con 401
//  2. Se llama a /api/auth/refresh con el refresh_token guardado
//  3. Si tiene éxito → actualiza los tokens y reintenta la petición original
//  4. Si falla → limpia la sesión y redirige al login con aviso
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

function processPendingQueue(error: any, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
}

function clearSessionAndRedirect() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  Cookies.remove('auth_token');
  // Redirigir al login con aviso de sesión expirada
  if (typeof window !== 'undefined') {
    window.location.href = '/es/login?expired=1';
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Solo actuamos ante 401 y si no es la propia ruta de refresh/login
    const isAuthRoute = originalRequest?.url?.includes('/auth/');
    if (error.response?.status !== 401 || isAuthRoute || originalRequest._retried) {
      return Promise.reject(error);
    }

    // Marcar para no volver a reintentar infinitamente
    originalRequest._retried = true;

    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (!storedRefreshToken) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    // Si ya hay un refresh en curso, encolar esta petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
        refresh_token: storedRefreshToken,
      });

      // Guardar los nuevos tokens
      const newToken        = data.token;
      const newRefreshToken = data.refresh_token;

      localStorage.setItem('auth_token',    newToken);
      localStorage.setItem('refresh_token', newRefreshToken);
      Cookies.set('auth_token', newToken, { expires: 30 });

      // Procesar peticiones encoladas y reintentar la original
      processPendingQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      processPendingQueue(refreshError, null);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
