/**
 * Email validation using regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation - Checks if password meets requirements
 * @param {string} password - Password to validate
 * @returns {object} - Object containing validation result and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Vui lòng nhập mật khẩu' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  
  // Additional strength checks could be added here
  // For example: requiring uppercase, lowercase, numbers, etc.
  
  return { isValid: true, message: '' };
};

/**
 * Validates login form data
 * @param {Object} formData - The login form data to validate
 * @returns {Object} - An object containing validation errors, if any
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  // Email validation
  if (!formData.email) {
    errors.email = 'Vui lòng nhập email';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  // Password validation
  if (!formData.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  } else if (formData.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  
  return errors;
};

/**
 * Validates registration form data
 * @param {Object} formData - The registration form data to validate
 * @returns {Object} - An object containing validation errors, if any
 */
export const validateRegisterForm = (formData) => {
  const errors = {};
  
  // Name validation
  if (!formData.name) {
    errors.name = 'Vui lòng nhập họ tên';
  }
  
  // Email validation
  if (!formData.email) {
    errors.email = 'Vui lòng nhập email';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  // Password validation
  if (!formData.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  } else if (formData.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  
  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu không khớp';
  }
  
  // Grade validation for students
  if (!formData.grade && formData.role === 'student') {
    errors.grade = 'Vui lòng chọn lớp';
  }
  
  return errors;
};

/**
 * Form validation for password reset
 * @param {object} formData - Password reset form data
 * @returns {object} - Object containing errors for each field
 */
export const validateResetPasswordForm = (formData) => {
  const errors = {};
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }
  
  // Validate password confirmation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu không khớp';
  }
  
  return errors;
};

/**
 * Form validation for changing password
 * @param {object} formData - Change password form data
 * @returns {object} - Object containing errors for each field
 */
export const validateChangePasswordForm = (formData) => {
  const errors = {};
  
  // Validate current password
  if (!formData.currentPassword) {
    errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
  }
  
  // Validate new password
  const passwordValidation = validatePassword(formData.newPassword);
  if (!passwordValidation.isValid) {
    errors.newPassword = passwordValidation.message;
  } else if (formData.newPassword === formData.currentPassword) {
    errors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
  }
  
  // Validate password confirmation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
  } else if (formData.newPassword !== formData.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }
  
  return errors;
};
