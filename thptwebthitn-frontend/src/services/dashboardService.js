import apiClient from './apiClient';

/**
 * Lấy dữ liệu cho Dashboard
 * @returns {Promise} Promise trả về dữ liệu cho Dashboard
 */
export const getDashboardData = async () => {
  try {
    // Gọi API endpoint để lấy dữ liệu Dashboard
    const response = await apiClient.get('/api/Dashboard');
    
    // Cấu trúc dữ liệu mong đợi từ API
    // {
    //   stats: {
    //     testsCompleted: number,
    //     testsCompletedChange: number,  // % thay đổi so với tháng trước
    //     averageScore: number,
    //     averageScoreChange: number,    // % thay đổi so với tháng trước
    //     studyTime: number,             // số giờ học tập
    //     studyTimeChange: number,       // % thay đổi so với tháng trước
    //     strengths: string              // môn học mạnh nhất
    //   },
    //   recentExams: [
    //     {
    //       id: number,
    //       title: string,
    //       subject: string,
    //       duration: string,
    //       progress: number,           // % hoàn thành (0-100)
    //       questions: number,          // tổng số câu hỏi
    //       completed: number           // số câu đã hoàn thành
    //     }
    //   ],
    //   activities: [
    //     {
    //       id: number,
    //       title: string,
    //       time: string,
    //       type: string,              // 'test', 'achievement', 'course', 'streak'
    //       color: string              // định dạng 'R, G, B' (optional)
    //     }
    //   ],
    //   events: [
    //     {
    //       id: number,
    //       title: string,
    //       date: string
    //     }
    //   ]
    // }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Xử lý lỗi
    if (error.response) {
      // Lỗi từ server
      console.error('Server error response:', error.response.data);
      console.error('Server error status:', error.response.status);
    } else if (error.request) {
      // Không nhận được phản hồi từ server
      console.error('No response received:', error.request);
    } else {
      // Lỗi khi setup request
      console.error('Request error:', error.message);
    }
    
    throw error;
  }
};

/**
 * Lấy chi tiết thống kê
 * @returns {Promise} Promise trả về dữ liệu thống kê chi tiết
 */
export const getDetailedStats = async () => {
  try {
    const response = await apiClient.get('/api/Dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed stats:', error);
    throw error;
  }
};

/**
 * Lấy danh sách hoạt động gần đây
 * @param {number} limit - Số lượng hoạt động cần lấy
 * @returns {Promise} Promise trả về danh sách hoạt động
 */
export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await apiClient.get(`/api/Dashboard/activities?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Lấy danh sách sự kiện sắp tới
 * @returns {Promise} Promise trả về danh sách sự kiện
 */
export const getUpcomingEvents = async () => {
  try {
    const response = await apiClient.get('/api/Dashboard/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};