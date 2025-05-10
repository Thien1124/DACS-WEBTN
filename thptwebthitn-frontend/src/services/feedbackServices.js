import apiClient from './apiClient';

const feedbackServices = {
  // Gửi phản hồi về bài thi
  submitFeedback: async (testId, feedbackData) => {
    try {
      // Format the data properly before sending
      const formattedData = {
        content: feedbackData.content?.trim() || '',
        feedbackType: Number(feedbackData.feedbackType || 0),
        // Only include questionId if it's valid to avoid foreign key issues
        ...(feedbackData.questionId ? { questionId: Number(feedbackData.questionId) } : {})
      };
      
      console.log('Submitting feedback with data:', formattedData);
      
      const response = await apiClient.post(`/api/tests/${testId}/feedback`, formattedData);
      return response.data;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // Enhanced error logging to help debugging
      if (error.response) {
        console.error("Server response data:", error.response.data);
        console.error("Server response status:", error.response.status);
        console.error("Server response headers:", error.response.headers);
      }
      throw error;
    }
  },

  // Lấy chi tiết một phản hồi
  getFeedback: async (feedbackId) => {
    try {
      const response = await apiClient.get(`/api/tests/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw error;
    }
  },

  // Lấy danh sách phản hồi của người dùng hiện tại
  getMyFeedbacks: async (page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get('/api/tests/my-feedbacks', {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user feedbacks:", error);
      throw error;
    }
  },

  // Lấy danh sách phản hồi của một bài thi
  getTestFeedbacks: async (testId, page = 1, pageSize = 10, status) => {
    try {
      const params = { page, pageSize };
      if (status !== undefined) {
        params.status = status;
      }
      
      const response = await apiClient.get(`/api/tests/${testId}/feedbacks`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching feedbacks for test ${testId}:`, error);
      throw error;
    }
  },

  // Chỉ dành cho admin: Lấy tất cả các phản hồi
  getAllFeedbacks: async (page = 1, pageSize = 10, status) => {
    try {
      const params = { page, pageSize };
      if (status !== undefined) {
        params.status = status;
      }
      
      const response = await apiClient.get('/api/tests/all-feedbacks', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching all feedbacks:", error);
      throw error;
    }
  },

  // Chỉ dành cho admin: Xử lý phản hồi
  resolveFeedback: async (testId, feedbackId, resolveData) => {
    try {
      const response = await apiClient.post(`/api/tests/${testId}/resolve-feedback/${feedbackId}`, resolveData);
      return response.data;
    } catch (error) {
      console.error(`Error resolving feedback ${feedbackId}:`, error);
      throw error;
    }
  }
};

export default feedbackServices;

// Get all feedbacks (admin only)
export const getAllFeedbacks = async (page = 1, pageSize = 10, status = null) => {
  try {
    const params = { page, pageSize };
    if (status !== null) {
      params.status = status;
    }
    
    const response = await apiClient.get('/api/tests/all-feedbacks', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all feedbacks:', error);
    throw error;
  }
};

// Get feedback details
export const getFeedbackById = async (id) => {
  try {
    const response = await apiClient.get(`/api/tests/feedback/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback details:', error);
    throw error;
  }
};

// Resolve a feedback
export const resolveFeedback = async (testId, feedbackId, responseContent, status = 1) => {
  try {
    const response = await apiClient.post(`/api/tests/${testId}/resolve-feedback/${feedbackId}`, { 
      responseContent,
      status: parseInt(status, 10) // Ensure status is an integer
    });
    return response.data;
  } catch (error) {
    console.error('Error resolving feedback:', error);
    throw error;
  }
};

// Get user's own feedbacks
export const getMyFeedbacks = async (page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get('/api/tests/my-feedbacks', {
      params: { page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user feedbacks:', error);
    throw error;
  }
};

// Get test feedbacks
export const getTestFeedbacks = async (testId, page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get(`/api/tests/${testId}/feedbacks`, {
      params: { page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching test feedbacks:', error);
    throw error;
  }
};