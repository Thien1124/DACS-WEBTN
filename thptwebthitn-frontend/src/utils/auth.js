/**
 * Get the authentication token from local storage
 * @returns {string|null} - The token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Set the authentication token in local storage
 * @param {string} token - The token to store
 */
export const setToken = (token) => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove the authentication token from local storage
 */
export const removeToken = () => {
  localStorage.removeItem('auth_token');
};

/**
 * Check if the user is authenticated (has a token)
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Save user data to local storage
 * @param {object} userData - User data to store
 */
export const saveUserData = (userData) => {
  localStorage.setItem('user_data', JSON.stringify(userData));
};

/**
 * Get user data from local storage
 * @returns {object|null} - User data or null if not found
 */
export const getUserData = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Remove user data from local storage
 */
export const removeUserData = () => {
  localStorage.removeItem('user_data');
};

/**
 * Handle logout - clear all auth-related data
 */
export const logout = () => {
  removeToken();
  removeUserData();
};
