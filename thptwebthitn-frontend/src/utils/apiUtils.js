/**
 * Chuẩn hóa dữ liệu trả về từ API để luôn có cấu trúc nhất quán
 * @param {any} response - Dữ liệu trả về từ API
 * @returns {Array} - Mảng dữ liệu chuẩn hóa
 */
export const normalizeApiResponse = (response) => {
  // Nếu đã là mảng, trả về luôn
  if (Array.isArray(response)) {
    return response;
  }
  
  // Các trường hợp phổ biến
  if (response?.list && Array.isArray(response.list)) {
    return response.list;
  }
  
  if (response?.items && Array.isArray(response.items)) {
    return response.items;
  }
  
  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Tìm thuộc tính là mảng trong đối tượng
  if (response && typeof response === 'object') {
    const arrayProps = Object.keys(response).filter(key => Array.isArray(response[key]));
    if (arrayProps.length > 0) {
      return response[arrayProps[0]];
    }
  }
  
  console.warn('Không thể chuẩn hóa dữ liệu từ API:', response);
  return [];
};