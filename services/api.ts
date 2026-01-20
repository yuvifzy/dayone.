
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * STRATEGIC CONTINUITY LAYER
 * Simulates backend logic if the server is unreachable.
 */
const getLocalStore = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(`dayone_${key}`) || '[]');
  } catch (e) {
    return [];
  }
};

const setLocalStore = (key: string, data: any) => localStorage.setItem(`dayone_${key}`, JSON.stringify(data));

const simulateBackend = async (config: any) => {
  const { url, method, data: rawData } = config;
  
  let data = rawData;
  if (typeof rawData === 'string' && rawData.length > 0) {
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      data = rawData;
    }
  }

  console.warn(`[DayOne Proxy] ${method.toUpperCase()} ${url} -> Local Continuity`);
  await new Promise(resolve => setTimeout(resolve, 400));

  const createSimResponse = (payload: any, status = 200) => ({
    data: payload,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config
  });

  const createSimError = (message: string, status: number) => ({
    response: {
      status,
      data: { message, error: 'Unauthorized', status }
    },
    message: message || `Request failed with status code ${status}`,
    config,
    isAxiosError: true
  });

  // Auth: Register
  if (url.includes('/auth/register')) {
    const users = getLocalStore('users');
    if (users.find((u: any) => u.email === data?.email)) {
      throw createSimError('ID COLLISION: This operator ID is already registered.', 409);
    }
    const newUser = { id: 'u_' + Date.now(), name: data?.name || 'Operator', email: data?.email, role: 'USER' };
    users.push({ ...newUser, password: data?.password });
    setLocalStore('users', users);
    const token = `sim_jwt_${btoa(JSON.stringify(newUser))}`;
    return createSimResponse({ token, user: newUser });
  }

  // Auth: Login
  if (url.includes('/auth/login')) {
    const users = getLocalStore('users');
    if (users.length === 0) {
      throw createSimError('TERMINAL EMPTY: No operators registered in Local Persistence. Please Register first.', 401);
    }
    const user = users.find((u: any) => u.email === data?.email && u.password === data?.password);
    if (!user) throw createSimError('AUTHENTICATION FAILED: Invalid Protocol ID or Access Key.', 401);
    
    const { password, ...userSafe } = user;
    const token = `sim_jwt_${btoa(JSON.stringify(userSafe))}`;
    return createSimResponse({ token, user: userSafe });
  }

  // Auth: Identity check
  if (url.includes('/auth/me')) {
    const token = localStorage.getItem('token');
    if (!token) throw createSimError('Session Required', 401);
    
    // If it's a real token but we're in simulation, we can't verify it. Reset.
    if (!token.startsWith('sim_jwt_')) {
       throw createSimError('Backend Session Mismatch. Please re-authenticate.', 401);
    }

    try {
      const userData = JSON.parse(atob(token.split('_')[2]));
      return createSimResponse(userData);
    } catch (e) {
      throw createSimError('CORRUPT SESSION: Re-authentication required.', 401);
    }
  }

  // Tasks CRUD
  if (url.includes('/tasks')) {
    const token = localStorage.getItem('token');
    if (!token) throw createSimError('Access Denied', 401);
    
    let userId = 'demo';
    try {
      if (token.startsWith('sim_jwt_')) {
        userId = JSON.parse(atob(token.split('_')[2])).id;
      }
    } catch (e) {}
    
    let tasks = getLocalStore('tasks');

    if (method === 'get') {
      return createSimResponse(tasks.filter((t: any) => t.userId === userId));
    }
    if (method === 'post') {
      const newTask = { ...data, id: 't_' + Math.random().toString(36).substr(2, 9), userId };
      tasks.push(newTask);
      setLocalStore('tasks', tasks);
      return createSimResponse(newTask);
    }
    if (method === 'put' || method === 'patch') {
      const id = url.split('/').pop();
      tasks = tasks.map((t: any) => t.id === id ? { ...t, ...data } : t);
      setLocalStore('tasks', tasks);
      return createSimResponse(tasks.find((t: any) => t.id === id));
    }
    if (method === 'delete') {
      const id = url.split('/').pop();
      tasks = tasks.filter((t: any) => t.id !== id);
      setLocalStore('tasks', tasks);
      return createSimResponse({}, 204);
    }
  }

  throw createSimError('Service Endpoint Offline', 404);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Direct redirection for Network Errors or specific dev-preview conditions
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      try {
        return await simulateBackend(originalRequest);
      } catch (simError) {
        return Promise.reject(simError);
      }
    }

    // Auto-logout on valid 401 responses from real backend
    if (error.response?.status === 401) {
      const isAuthPath = window.location.hash.includes('/login') || window.location.hash.includes('/register');
      if (!isAuthPath) {
        localStorage.removeItem('token');
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
