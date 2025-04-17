// Hàm xác định màu dựa trên vai trò
export const getUserRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          bg: '#fed7d7',
          text: '#742a2a',
          icon: '#e53e3e'
        };
      case 'teacher':
        return {
          bg: '#c6f6d5',
          text: '#22543d',
          icon: '#38a169'
        };
      case 'student':
        return {
          bg: '#e9d8fd',
          text: '#553c9a',
          icon: '#805ad5'
        };
      default:
        return {
          bg: '#e2e8f0',
          text: '#2d3748',
          icon: '#718096'
        };
    }
  };