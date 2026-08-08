/**
 * Frontend Authentication Module
 * This abstracts token storage and retrieval. If you change your auth provider in the future,
 * you can update this file to integrate with the new auth logic without changing App.jsx everywhere.
 */

export const setToken = (token) => {
  localStorage.setItem('adminToken', token);
};

export const getToken = () => {
  return localStorage.getItem('adminToken');
};

export const removeToken = () => {
  localStorage.removeItem('adminToken');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
