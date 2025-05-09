import apiClient from '../services/apiClient';

const ReportService = {
  /**
   * Lấy báo cáo tổng quan về các kỳ thi trong hệ thống
   * @returns {Promise} Promise với dữ liệu báo cáo tổng quan
   */
  getReports() {
    return apiClient.get('/api/reports');
  },

  /**
   * Lấy báo cáo chi tiết về một kỳ thi cụ thể
   * @param {string|number} examId - ID của kỳ thi
   * @returns {Promise} Promise với dữ liệu báo cáo chi tiết
   */
  getExamReport(examId) {
    return apiClient.get(`/api/reports/exams/${examId}`);
  }
};

export default ReportService;