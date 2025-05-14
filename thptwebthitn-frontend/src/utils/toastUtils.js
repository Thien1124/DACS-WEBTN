import { toast } from 'react-toastify';

// Toast cho các thông báo thành công
export const showSuccessToast = (message, onCloseCallback) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    onClose: () => {
      if (onCloseCallback && typeof onCloseCallback === 'function') {
        onCloseCallback();
      }
    }
  });
};

// Toast cho các thông báo lỗi/thất bại
export const showErrorToast = (message, onCloseCallback) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    onClose: () => {
      if (onCloseCallback && typeof onCloseCallback === 'function') {
        onCloseCallback();
      }
    }
  });
};

// Toast cho các thông báo cảnh báo
export const showWarningToast = (message, onCloseCallback) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    onClose: () => {
      if (onCloseCallback && typeof onCloseCallback === 'function') {
        onCloseCallback();
      }
    }
  });
};

// Toast cho các thông báo thông tin
export const showInfoToast = (message, onCloseCallback) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    onClose: () => {
      if (onCloseCallback && typeof onCloseCallback === 'function') {
        onCloseCallback();
      }
    }
  });
};
// Toast cho các thông báo đang tải
export const showLoadingToast = (message) => {
  return toast.loading(message, {
    position: "top-right",
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false
  });
};

// Cập nhật toast (chuyển từ loading sang success/error)
export const updateToast = (toastId, { content, type }) => {
  toast.update(toastId, {
    render: content,
    type: type,
    isLoading: false,
    autoClose: 2000,
    closeOnClick: true
  });
};