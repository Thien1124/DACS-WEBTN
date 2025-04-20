export const parseLoginError = (error) => {
  if (!error) return { general: 'Đã xảy ra lỗi không xác định' };
  
  // Chuẩn hóa thông báo lỗi
  const errorMessage = typeof error.message === 'string' 
    ? error.message 
    : 'Đăng nhập thất bại. Vui lòng thử lại.';
  
  // Nếu server trả về field cụ thể
  if (error.field) {
    return { [error.field]: errorMessage };
  }
  
  // Nếu server trả về nhiều lỗi
  if (error.errors && typeof error.errors === 'object') {
    return error.errors;
  }
  
  // Phân tích nội dung thông báo lỗi
  if (errorMessage.toLowerCase().match(/tài khoản|không tồn tại|không tìm thấy|username|email/)) {
    return { usernameOrEmail: errorMessage };
  } 
  
  if (errorMessage.toLowerCase().match(/mật khẩu|password|sai|không chính xác/)) {
    return { password: errorMessage };
  }
  
  // Lỗi chung
  return { general: errorMessage };
};