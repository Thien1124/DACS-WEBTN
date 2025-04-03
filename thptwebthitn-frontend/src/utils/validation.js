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
 * Validates if a string could be an email
 * @param {string} str - String to check
 * @returns {boolean} - True if string looks like an email
 */
export const isLikelyEmail = (str) => {
  return str.includes('@');
};

/**
 * Phone number validation
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if phone number is valid
 */
export const isValidPhoneNumber = (phoneNumber) => {
  // Simple validation for Vietnamese phone numbers
  const phoneRegex = /^(0|\+84)(\d{9,10})$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Validates login form data
 * @param {Object} formData - The login form data to validate
 * @returns {Object} - An object containing validation errors, if any
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  // Username or Email validation
  if (!formData.usernameOrEmail) {
    errors.usernameOrEmail = 'Vui lòng nhập tên đăng nhập hoặc email';
  } else if (isLikelyEmail(formData.usernameOrEmail) && !isValidEmail(formData.usernameOrEmail)) {
    errors.usernameOrEmail = 'Email không hợp lệ';
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
  
  // Username validation
  if (!formData.username) {
    errors.username = 'Vui lòng nhập tên đăng nhập';
  } else if (formData.username.length < 3) {
    errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
  }
  
  // Email validation
  if (!formData.email) {
    errors.email = 'Vui lòng nhập email';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  // Full name validation
  if (!formData.fullName) {
    errors.fullName = 'Vui lòng nhập họ tên đầy đủ';
  }
  
  // Phone number validation
  if (!formData.phoneNumber) {
    errors.phoneNumber = 'Vui lòng nhập số điện thoại';
  } else if (!isValidPhoneNumber(formData.phoneNumber)) {
    errors.phoneNumber = 'Số điện thoại không hợp lệ';
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