import { showErrorToast } from './toastUtils';

export const handleApiError = (error, setErrorState = null) => {
  // Xác định loại lỗi
  let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
  
  if (error.response) {
    // Lỗi từ phản hồi server (status code nằm ngoài phạm vi 2xx)
    const status = error.response.status;
    
    if (status === 401) {
      errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    } else if (status === 403) {
      errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
    } else if (status === 404) {
      errorMessage = 'Không tìm thấy tài nguyên yêu cầu.';
    } else if (error.response.data?.message) {
      errorMessage = error.response.data.message;
    }
  } else if (error.request) {
    // Request đã gửi nhưng không nhận được response
    errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
  } 
  
  // Hiển thị thông báo lỗi
  showErrorToast(errorMessage);
  
  // Cập nhật state lỗi nếu cần
  if (setErrorState) {
    setErrorState(errorMessage);
  }
  
  return errorMessage;
};