/**
 * Cấu hình liên quan đến authentication
 */
const authConfig = {
    // Thời gian hiệu lực của access token (phút)
    ACCESS_TOKEN_LIFETIME: 15,
    
    // Thời gian trước khi hết hạn để refresh token (phút)
    REFRESH_BEFORE_EXPIRATION: 1,
    
    // Thời gian cảnh báo token sắp hết hạn (phút)
    TOKEN_EXPIRING_THRESHOLD: 5,
    
    // Tên các key lưu trong localStorage
    STORAGE_KEYS: {
      ACCESS_TOKEN: 'accessToken',
      REFRESH_TOKEN: 'refreshToken',
      USER_INFO: 'userInfo'
    }
  };
  
  export default authConfig;