import axios from 'axios';
import { setAccessToken, getAccessToken, clearTokens, getTokenPayload } from './token';

// Constants for storage keys
const STORAGE_KEYS = {
  USER: 'user_data',
  REMEMBER_ME: 'remember_me'
};

/**
 * Get the authentication token from local storage
 * @returns {string|null} - The token or null if not found
 */
export const getToken = () => {
  const token = getAccessToken();
  return token ? `Bearer ${token}` : null;
};

/**
 * Get raw token without Bearer prefix
 * @returns {string|null} - The raw token or null if not found
 */
export const getRawToken = () => {
  return getAccessToken();
};

/**
 * Set the authentication token in local storage
 * @param {string} token - The token to store
 */
export const setToken = (token) => {
  // Remove 'Bearer ' prefix if it exists
  const rawToken = token.startsWith('Bearer ') 
    ? token.slice(7) 
    : token;
  setAccessToken(rawToken);
};

/**
 * Remove the authentication token from local storage
 */
export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  // Đồng bộ hóa: đảm bảo xóa tất cả các token
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Check if the user is authenticated (has a valid token)
 * @returns {boolean} - True if authenticated
 */
export const isTokenValid = () => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const payload = getTokenPayload(token);
    if (!payload) return false;
    
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < expirationTime;
  } catch {
    return false;
  }
};

/**
 * Save user data to local storage
 * @param {object} userData - User data to store
 */
export const saveUserData = (userData) => {
  try {
    const userRole = userData.role || (userData.roles && userData.roles.length > 0 ? userData.roles[0] : 'Student');
    const sanitizedData = {
      ...userData,
      role: userRole,
      roles: userData.roles || [userRole],
    };
    localStorage.setItem('user_data', JSON.stringify(sanitizedData));
    localStorage.setItem('user_role', userRole);
  } catch (error) {
    console.error('Error saving user data:', error);
    throw new Error('Không thể lưu thông tin người dùng');
  }
};

/**
 * Get user data from local storage
 * @returns {object|null} - User data or null if not found
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Remove user data from local storage
 */
export const removeUserData = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  // Đồng bộ hóa: đảm bảo xóa tất cả dữ liệu người dùng
  localStorage.removeItem('user_data');
};

/**
 * Handle logout - clear all auth-related data
 */
export const logout = () => {
  // Clear all auth-related data
  clearTokens();
  removeUserData();
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
};

/**
 * Update user data in local storage
 * @param {object} updates - Partial user data to update
 */
export const updateUserData = (updates) => {
  try {
    const currentData = getUserData();
    if (!currentData) throw new Error('No user data found');

    const updatedData = { ...currentData, ...updates };
    saveUserData(updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw new Error('Không thể cập nhật thông tin người dùng');
  }
};

/**
 * Check if token is about to expire
 * @param {number} thresholdMinutes - Minutes threshold before expiration
 * @returns {boolean} - True if token will expire soon
 */
export const isTokenExpiringSoon = (thresholdMinutes = 5) => {
  try {
    const token = getRawToken();
    if (!token) return false;

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;

    const payload = JSON.parse(atob(tokenParts[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const timeUntilExpiration = expirationTime - Date.now();
    
    return timeUntilExpiration <= thresholdMinutes * 60 * 1000;
  } catch {
    return false;
  }
};

/**
 * Get token expiration time
 * @returns {Date|null} - Token expiration date or null if no valid token
 */
export const getTokenExpirationTime = () => {
  try {
    const token = getRawToken();
    if (!token) return null;

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;

    const payload = JSON.parse(atob(tokenParts[1]));
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
};

/**
 * Set authentication token and update axios headers
 * @param {string|null} token - The token to set
 */
export const setAuthToken = (token) => {
  if (token) {
    setToken(token); // Use existing setToken function
    axios.defaults.headers.common['Authorization'] = getToken(); // Use existing getToken function that adds Bearer prefix
  } else {
    removeToken(); // Use existing removeToken function
    delete axios.defaults.headers.common['Authorization'];
  }
};