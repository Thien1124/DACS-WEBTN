import apiClient from './apiClient';

/**
 * Send a message in the chatbox
 * @param {Object} messageData - Message data
 * @param {string} messageData.content - Message content
 * @param {string} messageData.recipientId - Recipient user ID
 * @returns {Promise} - Promise resolving to sent message
 */
export const sendChatMessage = async (messageData) => {
  try {
    const response = await apiClient.post('/api/chat/message', {
      receiverId: messageData.receiverId,
      content: messageData.content
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get conversation with a specific user
 * @param {string} userId - User ID to get conversation with
 * @returns {Promise} - Promise resolving to conversation data
 */
export const getConversation = async (userId) => {
  try {
    console.log(`Getting conversation with user ${userId}`);
    
    // 1. Lấy tin nhắn học sinh gửi ĐẾN admin
    const sentToAdmin = await apiClient.get(`/api/chat/conversation/${userId}?page=1&pageSize=50`);
    
    // 2. Lấy tin nhắn admin gửi ĐẾN học sinh (thông qua API unread)
    // Đây là giải pháp tạm thời. Lý tưởng nhất là backend nên cung cấp API để lấy cả 2 chiều
    const allMessages = await getUnreadMessages();
    
    // Log để debug
    console.log("Messages sent to admin:", sentToAdmin.data);
    console.log("All unread messages:", allMessages);
    
    // Xử lý data từ API 1
    let sentMessages = [];
    if (sentToAdmin.data) {
      if (Array.isArray(sentToAdmin.data)) {
        sentMessages = sentToAdmin.data;
      } else if (sentToAdmin.data.data && Array.isArray(sentToAdmin.data.data)) {
        sentMessages = sentToAdmin.data.data;
      }
    }
    
    // Xử lý data từ API 2 - lọc chỉ tin nhắn từ admin đến học sinh
    let receivedMessages = [];
    if (Array.isArray(allMessages)) {
      // Lọc tin nhắn từ admin (có senderId là userID của admin)
      receivedMessages = allMessages.filter(msg => msg.senderId === userId);
    } else if (allMessages && Array.isArray(allMessages.data)) {
      receivedMessages = allMessages.data.filter(msg => msg.senderId === userId);
    }
    
    // Kết hợp 2 danh sách
    const combinedMessages = [...sentMessages, ...receivedMessages];
    
    // Sắp xếp theo thời gian
    combinedMessages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    
    console.log("Combined conversation:", combinedMessages);
    
    return combinedMessages;
  } catch (error) {
    console.error(`Error in getConversation: ${error.message}`);
    throw error;
  }
};

/**
 * Get unread messages for the current user
 * @returns {Promise} - Promise resolving to unread messages
 */
export const getUnreadMessages = async () => {
  try {
    const response = await apiClient.get('/api/chat/unread');
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getStudentConversations = async (currentUser) => {
  try {
    // Lấy danh sách tin nhắn chưa đọc
    const unreadResponse = await getUnreadMessages();
    console.log("Unread messages response:", unreadResponse);
    
    // Xử lý dữ liệu từ API
    const messages = Array.isArray(unreadResponse) ? unreadResponse : 
                    (unreadResponse && Array.isArray(unreadResponse.data)) ? 
                    unreadResponse.data : [];
    
    // Nếu không có tin nhắn chưa đọc, trả về mảng rỗng - có thể cải thiện sau
    if (messages.length === 0) {
      console.log("No unread messages found");
      return [];
    }
    
    // Map để lưu thông tin học sinh đã gửi tin nhắn
    const studentMap = {};
    
    // Trích xuất thông tin học sinh từ tin nhắn
    messages.forEach(msg => {
      // ID của admin/teacher hiện tại (phải được truyền vào function)
      const adminId = currentUser?.id || 5; // Fallback to 5 if not provided
      
      // Nếu là tin nhắn từ học sinh gửi đến admin
      if (msg.senderId !== adminId) {
        if (!studentMap[msg.senderId]) {
          studentMap[msg.senderId] = {
            studentId: msg.senderId,
            studentName: msg.senderName || `Học sinh ${msg.senderId}`,
            unreadCount: 1,
            lastMessage: msg.content,
            lastMessageTime: msg.sentAt
          };
        } else {
          studentMap[msg.senderId].unreadCount++;
          // Update last message if newer
          if (new Date(msg.sentAt) > new Date(studentMap[msg.senderId].lastMessageTime)) {
            studentMap[msg.senderId].lastMessage = msg.content;
            studentMap[msg.senderId].lastMessageTime = msg.sentAt;
          }
        }
      }
    });
    
    // Chuyển map thành array và sắp xếp theo thời gian
    return Object.values(studentMap).sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
  } catch (error) {
    console.error("Error getting student conversations:", error);
    return [];
  }
};