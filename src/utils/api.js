const BASE_URL = 'http://localhost:5000/api';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 204) { 
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

export const getModules = () => apiFetch('/modules');
export const getModule = (id) => apiFetch(`/modules/${id}`);
export const createModule = (moduleData) => apiFetch('/modules', { method: 'POST', body: moduleData }); 
export const createTopic = (moduleId, topicData) => apiFetch(`/modules/${moduleId}/topics`, { method: 'POST', body: JSON.stringify(topicData) });
export const createMaterial = (moduleId, materialData) => apiFetch(`/modules/${moduleId}/materials`, { method: 'POST', body: materialData }); 
export const updateModule = (id, moduleData) => apiFetch(`/modules/${id}`, { method: 'PUT', body: moduleData }); 
export const deleteModule = (id) => apiFetch(`/modules/${id}`, { method: 'DELETE' });
export const getMaterialById = (moduleId, materialId) => apiFetch(`/modules/${moduleId}/materials/${materialId}`);
export const updateMaterial = (moduleId, materialId, materialData) => apiFetch(`/modules/${moduleId}/materials/${materialId}`, { method: 'PUT', body: materialData });
export const getModuleProgress = (moduleId) => apiFetch(`/modules/${moduleId}/progress`);
export const markMaterialAsCompleted = (moduleId, materialId) => apiFetch(`/modules/${moduleId}/materials/${materialId}/complete`, { method: 'POST' });

export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const userData = parseJwt(token);
    return userData ? userData.user : null;
};

export const getAllUsers = () => apiFetch('/users');
export const updateUserRole = (id, role) => apiFetch(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
export const deleteUser = (id) => apiFetch(`/users/${id}`, { method: 'DELETE' });