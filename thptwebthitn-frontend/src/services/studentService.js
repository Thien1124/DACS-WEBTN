import apiClient from './apiClient';

/**
 * Xuất danh sách học sinh theo lớp
 * @param {Object} data - Thông tin lớp và các tham số lọc để xuất danh sách
 * @returns {Promise} Promise với dữ liệu xuất
 */
const exportStudents = (data) => {
  return apiClient.post('/api/students/export', data, {
    responseType: 'blob' // Để xử lý tải xuống file
  });
};
const exportScores = (data) => {
    return apiClient.post('/api/scores/export', data, {
      responseType: 'blob' // Để xử lý tải xuống file
    });
  };
// Add to your existing exports or modify as needed
export { exportStudents ,exportScores};