import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPaperPlane, 
  FaUserCircle, 
  FaChevronDown,
  FaBell,
  FaGraduationCap,
  FaCircle,
  FaUser
} from 'react-icons/fa';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import { sendChatMessage, getConversation, getUnreadMessages, getStudentConversations } from '../../services/chatService';
import { showErrorToast } from '../../utils/toastUtils';

// Reuse most of the styled components from ChatBox.jsx
// Add these styled components after your imports
const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f8f9fa'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333333'};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  }
  
  h3 {
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

const ChatHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  height: 400px;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  position: relative;
  align-self: ${props => props.isOutgoing ? 'flex-end' : 'flex-start'};
  background-color: ${props => 
    props.isOutgoing 
      ? (props.theme === 'dark' ? '#4299e1' : '#3182ce') 
      : (props.theme === 'dark' ? '#4a5568' : '#e2e8f0')
  };
  color: ${props => 
    props.isOutgoing 
      ? '#ffffff' 
      : (props.theme === 'dark' ? '#e2e8f0' : '#2d3748')
  };
`;

const MessageHeader = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const MessageText = styled.div`
  word-break: break-word;
`;

const MessageTime = styled.div`
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.25rem;
  text-align: right;
`;

const MessageStatus = styled.div`
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.1rem;
  text-align: right;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 0.8rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 0.8rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 1.5rem;
  padding: 0.8rem 1.5rem;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3182ce;
  }
  
  &:disabled {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
    cursor: not-allowed;
  }
  
  svg {
    font-size: 1rem;
  }
`;
// Additional styled components for the student list
const SidebarContainer = styled.div`
  width: 250px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-right: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  overflow-y: auto;
`;

const StudentItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: ${props => props.active 
    ? (props.theme === 'dark' ? '#4a5568' : '#e2e8f0')
    : 'transparent'};
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
`;

const StudentName = styled.div`
  font-weight: ${props => props.unread ? 'bold' : 'normal'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const UnreadBadge = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e53e3e;
  margin-left: auto;
`;

const MainLayout = styled.div`
  display: flex;
  height: 70vh;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ChatSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const EmptyStateInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    margin-bottom: 0.5rem;
  }
`;

const RefreshButton = styled.button`
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3182ce;
  }
  
  &:disabled {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
    cursor: not-allowed;
  }
`;

const TeacherChatBox = () => {
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  
  // Fetch list of students who have messaged
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Current user in fetchStudents:", user);
        
        // Truyền user hiện tại vào hàm getStudentConversations
        const studentsData = await getStudentConversations(user);
        
        console.log("Students data from API:", studentsData);
        
        if (Array.isArray(studentsData) && studentsData.length > 0) {
          const formattedStudents = studentsData.map(student => ({
            id: student.studentId,
            name: student.studentName || `Học sinh ${student.studentId}`,
            unreadCount: student.unreadCount || 0,
            lastMessage: student.lastMessage || 'Tin nhắn mới',
            lastMessageTime: student.lastMessageTime ? 
              new Date(student.lastMessageTime).toLocaleTimeString([], 
              { hour: '2-digit', minute: '2-digit' }) : ''
          }));
          
          setStudents(formattedStudents);
          
          // Nếu chưa chọn học sinh, chọn học sinh đầu tiên
          if (!selectedStudent && formattedStudents.length > 0) {
            setSelectedStudent(formattedStudents[0]);
          }
        } else {
          // Không có học sinh nào
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching student conversations:', error);
        setError('Không thể tải danh sách học sinh');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
    
    // Cập nhật danh sách học sinh mỗi 30 giây
    const interval = setInterval(fetchStudents, 30000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  // Fetch messages when a student is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedStudent) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Đảm bảo studentId là số nguyên (quan trọng!)
        const studentId = parseInt(selectedStudent.id);
        
        console.log("Fetching messages for student ID:", studentId, "Type:", typeof studentId);
        
        // Gọi API với ID học sinh dạng số
        const data = await getConversation(studentId);
        
        console.log("Conversation API response:", data);
        
        // Kiểm tra cả 2 trường hợp cấu trúc dữ liệu API có thể trả về
        let messagesData = [];
        if (Array.isArray(data)) {
          messagesData = data;
        } else if (data && Array.isArray(data.data)) {
          messagesData = data.data;
        }
        
        if (messagesData.length > 0) {
          // Format messages for display
          const formattedMessages = messagesData.map(msg => ({
            id: msg.id,
            sender: {
              id: msg.senderId,
              name: msg.senderId === studentId ? 
                selectedStudent.name : user?.fullName || 'Bạn',
              role: msg.senderId === studentId ? 'student' : 'admin'
            },
            text: msg.content,
            time: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: msg.isRead
          }));
          
          console.log("Formatted messages:", formattedMessages);
          // Trong hàm fetchMessages khi nhận tin nhắn từ API
          // Thêm dòng này sau khi tạo formattedMessages
          formattedMessages.sort((a, b) => {
            // Chuyển đổi time string về định dạng so sánh được
            const timeA = new Date(`${new Date().toDateString()} ${a.time}`);
            const timeB = new Date(`${new Date().toDateString()} ${b.time}`);
            return timeA - timeB;
          });
          setMessages(formattedMessages);
        } else {
          console.log("No messages found for student:", studentId);
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Không thể tải tin nhắn');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [selectedStudent, user]);
  
 
  
  // Poll for new messages from the selected student
  useEffect(() => {
    if (!selectedStudent) return;
    
    const pollInterval = setInterval(async () => {
      try {
        // Check unread messages
        const unreadData = await getUnreadMessages();
        
        // Check if any unread messages are from the selected student
        const hasNewMessagesFromSelected = Array.isArray(unreadData) && 
          unreadData.some(msg => msg.senderId === selectedStudent.id);
        
        if (hasNewMessagesFromSelected) {
          // Refetch the conversation
          const data = await getConversation(selectedStudent.id);
          
          if (Array.isArray(data)) {
            const formattedMessages = data.map(msg => ({
              id: msg.id,
              sender: {
                id: msg.senderId,
                name: msg.senderId === selectedStudent.id ? selectedStudent.name : user?.fullName || 'You',
                role: msg.senderId === selectedStudent.id ? 'student' : user?.role || 'teacher'
              },
              text: msg.content,
              time: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isRead: msg.isRead
            }));
            
            setMessages(formattedMessages);
          }
        }
        
        // Also check for new students or unread counts
        const studentsData = await getStudentConversations();
        
        if (Array.isArray(studentsData)) {
          const formattedStudents = studentsData.map(student => ({
            id: student.studentId,
            name: student.studentName || `Student ${student.studentId}`,
            unreadCount: student.unreadCount || 0,
            lastMessage: student.lastMessage || '',
            lastMessageTime: student.lastMessageTime ? new Date(student.lastMessageTime) : new Date()
          }));
          
          // Sort by unread first, then by most recent message
          formattedStudents.sort((a, b) => {
            if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
            if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
            return b.lastMessageTime - a.lastMessageTime;
          });
          
          setStudents(formattedStudents);
        }
      } catch (error) {
        console.error('Error checking for new messages:', error);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(pollInterval);
  }, [selectedStudent, user]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;
    
    // Create temporary message for UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: {
        id: user?.id,
        name: user?.fullName || 'You',
        role: user?.role || 'teacher'
      },
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      isSending: true
    };
    
    // Add message to UI immediately
    setMessages(prev => [...prev, tempMessage]);
    
    // Clear input
    setNewMessage('');
    
    try {
      // Send message to API
      const response = await sendChatMessage({
        content: newMessage,
        receiverId: selectedStudent.id
      });
      
      // Replace temp message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? {
              id: response.id || tempMessage.id,
              sender: tempMessage.sender,
              text: tempMessage.text,
              time: tempMessage.time,
              isRead: false,
              isSending: false
            }
          : msg
      ));
      
      // Update the student in the list with the new last message
      setStudents(prev => 
        prev.map(student => 
          student.id === selectedStudent.id 
            ? { 
                ...student, 
                lastMessage: newMessage,
                lastMessageTime: new Date()
              }
            : student
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      showErrorToast('Không thể gửi tin nhắn');
      
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, isSending: false, failed: true }
          : msg
      ));
    }
  };
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title>Quản lý tin nhắn</Title>
          <RefreshButton onClick={() => {
            const fetchStudents = async () => {
              // Your code here
            };
            fetchStudents();
          }}>
            Làm mới danh sách
          </RefreshButton>
        </div>
        <MainLayout theme={theme}>
          <SidebarContainer theme={theme}>
            {loading && students.length === 0 ? (
              <EmptyState theme={theme}>
                <LoadingSpinner size={30} />
                <p>Đang tải...</p>
              </EmptyState>
            ) : students.length === 0 ? (
              <EmptyState theme={theme}>
                <FaUserCircle size={48} />
                <h3>Không có cuộc trò chuyện</h3>
                <p>Chưa có học sinh nào nhắn tin.</p>
              </EmptyState>
            ) : (
              students.map(student => (
                <StudentItem 
                  key={student.id} 
                  theme={theme}
                  active={selectedStudent?.id === student.id}
                  onClick={() => setSelectedStudent(student)}
                >
                  <StudentName unread={student.unreadCount > 0}>
                    <FaGraduationCap />
                    {student.name}
                  </StudentName>
                  {student.unreadCount > 0 && <UnreadBadge />}
                </StudentItem>
              ))
            )}
          </SidebarContainer>
          
          <ChatSection>
            {selectedStudent ? (
              <>
                <ChatHeader theme={theme}>
                  <Title theme={theme}>
                    <FaUser />
                    {selectedStudent.name}
                  </Title>
                </ChatHeader>
                
                <MessagesContainer theme={theme}>
                  {loading ? (
                    <EmptyState theme={theme}>
                      <LoadingSpinner size={30} />
                      <p>Đang tải tin nhắn...</p>
                    </EmptyState>
                  ) : error ? (
                    <EmptyState theme={theme}>
                      <FaBell size={48} />
                      <h3>Có lỗi xảy ra</h3>
                      <p>{error}</p>
                    </EmptyState>
                  ) : messages.length === 0 ? (
                    <EmptyState theme={theme}>
                      <FaUserCircle size={48} />
                      <h3>Không có tin nhắn</h3>
                      <p>Chưa có tin nhắn nào với học sinh này.</p>
                    </EmptyState>
                  ) : (
                    messages.map(message => (
                      <MessageBubble 
                        key={message.id} 
                        isOutgoing={message.sender.id === user?.id}
                        theme={theme}
                        style={message.failed ? { opacity: 0.6 } : {}}
                      >
                        {message.sender.id !== user?.id && (
                          <MessageHeader theme={theme}>
                            {message.sender.name}
                          </MessageHeader>
                        )}
                        <MessageText>{message.text}</MessageText>
                        <MessageTime theme={theme}>{message.time}</MessageTime>
                        {message.sender.id === user?.id && (
                          <MessageStatus theme={theme}>
                            {message.isSending 
                              ? 'Đang gửi...' 
                              : message.failed 
                              ? 'Không thể gửi' 
                              : message.isRead 
                              ? 'Đã xem' 
                              : 'Đã gửi'}
                          </MessageStatus>
                        )}
                      </MessageBubble>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </MessagesContainer>
                
                <InputContainer theme={theme}>
                  <MessageInput
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    theme={theme}
                    disabled={loading}
                  />
                  <SendButton 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || loading}
                  >
                    <FaPaperPlane />
                    Gửi
                  </SendButton>
                </InputContainer>
              </>
            ) : (
              <EmptyStateInfo theme={theme}>
                <FaUserCircle size={64} />
                <h3>Chọn một học sinh để xem tin nhắn</h3>
                <p>Chọn một học sinh từ danh sách bên trái để bắt đầu nhắn tin.</p>
              </EmptyStateInfo>
            )}
          </ChatSection>
        </MainLayout>
      </Container>
      <Footer />
    </PageWrapper>
  );
};

export default TeacherChatBox;