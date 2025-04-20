/**
 * Synchronizes authentication tokens across different storage keys
 * to ensure consistent authentication regardless of which key is used
 */
export const synchronizeTokens = () => {
  // Check all possible token locations
  const authToken = localStorage.getItem('auth_token');
  const token = localStorage.getItem('token');
  const accessToken = localStorage.getItem('accessToken');
  const jwt = localStorage.getItem('jwt');
  const sessionAuthToken = sessionStorage.getItem('auth_token');
  
  // Find the first valid token
  const validToken = authToken || token || accessToken || jwt || sessionAuthToken;
  
  if (validToken) {
    // Synchronize to all standard locations
    localStorage.setItem('auth_token', validToken);
    localStorage.setItem('token', validToken);
    
    console.log('Tokens synchronized successfully');
    return true;
  }
  
  console.log('No valid token found to synchronize');
  return false;
};

/**
 * Call this on app startup to ensure tokens are synchronized
 */
export const initializeTokens = () => {
  return synchronizeTokens();
};