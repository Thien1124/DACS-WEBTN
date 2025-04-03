import axios from 'axios';

// Constants for storage keys and token prefix
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  REMEMBER_ME: 'remember_me'
};

const TOKEN_PREFIX = 'Bearer';

/**
 * Get the authentication token from local storage
 * @returns {string|null} - The token or null if not found
 */
export const getToken = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return token ? `${TOKEN_PREFIX} ${token}` : null;
};

/**
 * Get raw token without Bearer prefix
 * @returns {string|null} - The raw token or null if not found
 */
export const getRawToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Set the authentication token in local storage
 * @param {string} token - The token to store
 */
export const setToken = (token) => {
  // Remove 'Bearer ' prefix if it exists
  const rawToken = token.startsWith(`${TOKEN_PREFIX} `) 
    ? token.slice(TOKEN_PREFIX.length + 1) 
    : token;
  localStorage.setItem(STORAGE_KEYS.TOKEN, rawToken);
};

/**
 * Remove the authentication token from local storage
 */
export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

/**
 * Check if the user is authenticated (has a valid token)
 * @returns {boolean} - True if authenticated
 */
export const isTokenValid = () => {
  const token = getRawToken();
  if (!token) return false;

  try {
    // Basic token validation (you might want to add more sophisticated validation)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;

    const payload = JSON.parse(atob(tokenParts[1]));
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
    const sanitizedData = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      roles: userData.roles || [],
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sanitizedData));
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
};

/**
 * Set remember me preference
 * @param {boolean} remember - Whether to remember the user
 */
export const setRememberMe = (remember) => {
  localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember);
};

/**
 * Get remember me preference
 * @returns {boolean} - Whether user chose to be remembered
 */
export const getRememberMe = () => {
  return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
};

/**
 * Handle logout - clear all auth-related data
 */
export const logout = () => {
  // Clear all auth-related data
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });

  // Optional: Reload the page to clear any sensitive data in memory
  // window.location.reload();
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