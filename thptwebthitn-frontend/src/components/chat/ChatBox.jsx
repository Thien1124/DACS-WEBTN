import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  FaPaperPlane, 
  FaUserCircle, 
  FaTimes,
  FaBell,
  FaHeadset,
  FaQuestionCircle,
  FaChevronDown,
  FaUser,
  FaChalkboardTeacher,
  FaUserShield
} from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';
import { sendChatMessage, getConversation, getUnreadMessages } from '../../services/chatService';
import { showErrorToast } from '../../utils/toastUtils';
import apiClient from '../../services/apiClient';

// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

// Update the container to use a flex layout for the new sidebar design
const Container = styled.div`
  max-width: 1200px; // Increased width to accommodate sidebar
  margin: 2rem auto;
  padding: 1.5rem;
  width: 100%;
`;

// Create a layout container for sidebar and chat
const ChatLayoutContainer = styled.div`
  display: flex;
  height: 70vh;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

// Create the sidebar component
const UsersSidebar = styled.div`
  width: 280px;
  height: 100%;
  border-right: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f8fafc'};
  display: flex;
  flex-direction: column;
`;

// Add a sidebar header
const SidebarHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  font-weight: 600;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

// Create a user list container
const UsersList = styled.div`
  flex: 1;
  overflow-y: auto;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#1e1e1e' : '#f1f1f1'};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme === 'dark' ? '#4a4a4a' : '#c1c1c1'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme === 'dark' ? '#555' : '#a8a8a8'};
  }
`;

// Create a styled user item component
const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  ${props => props.$isSelected && `
    background-color: ${props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    font-weight: 500;
  `}
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#3c475a' : '#edf2f7'};
  }
  
  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-right: 0.75rem;
    border-radius: 50%;
    background-color: ${props => {
      if (props.role === 'Admin') return props.theme === 'dark' ? '#553c39' : '#fed7d7';
      if (props.role === 'Teacher') return props.theme === 'dark' ? '#2c4a5a' : '#bee3f8';
      return props.theme === 'dark' ? '#2d3748' : '#e2e8f0';
    }};
    color: ${props => {
      if (props.role === 'Admin') return '#f56565';
      if (props.role === 'Teacher') return '#38b2ac';
      return '#4299e1';
    }};
  }
  
  .user-info {
    flex: 1;
    
    .user-name {
      font-weight: ${props => props.isSelected ? '600' : '500'};
      margin-bottom: 0.25rem;
    }
    
    .user-role {
      font-size: 0.8rem;
      color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
      display: flex;
      align-items: center;
      
      svg {
        margin-right: 0.25rem;
      }
    }
  }
  
  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-left: 0.5rem;
    background-color: ${props => props.$isOnline ? '#48bb78' : '#a0aec0'};
  }
`;

// Add a search input for the sidebar
const SidebarSearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

// Create pagination component for the sidebar
const SidebarPagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f8fafc'};
  
  button {
    background: none;
    border: none;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4299e1'};
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &:hover:not(:disabled) {
      color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#3182ce'};
    }
  }
`;

// Update the ChatContainer to be used inside the layout
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  color: ${props => props.$isOutgoing 
    ? '#ffffff' 
    : (props.theme === 'dark' ? '#e2e8f0' : '#2d3748')};
  background-color: ${props => props.$isOutgoing 
    ? '#9fd7f9' 
    : props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  align-self: ${props => props.$isOutgoing ? 'flex-end' : 'flex-start'};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    ${props => props.$isOutgoing ? 'right' : 'left'}: -10px;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    
    border-bottom: 0;
    margin-left: -10px;
    margin-bottom: 0px;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-left: auto;
`;

const MessageText = styled.p`
  margin: 0;
  word-break: break-word;
`;

const MessageStatus = styled.div`
  font-size: 0.75rem;
  text-align: right;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-top: 0.25rem;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 1rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  font-size: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  margin-left: 0.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3182ce;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  text-align: center;
  padding: 2rem;
`;

const SupportInfo = styled.div`
  margin: 0.5rem 0;
  padding: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  border-radius: 5px;
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
`;

// New styled components for receiver selection
const ReceiverSelector = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SelectorButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.95rem;
  
  &:hover {
    border-color: #4299e1;
  }
`;

// Update the SelectorDropdown to include custom scrollbar and handle pagination
const SelectorDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  z-index: 10;
  margin-top: 0.25rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#1e1e1e' : '#f1f1f1'};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme === 'dark' ? '#4a4a4a' : '#c1c1c1'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme === 'dark' ? '#555' : '#a8a8a8'};
  }
`;

// Create a pagination footer component
const PaginationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f8fafc'};
`;

const ReceiverOption = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
  
  ${props => props.isSelected && `
    background-color: ${props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
    font-weight: 500;
  `}
  
  .receiver-avatar {
    margin-right: 0.75rem;
    color: ${props => {
      if (props.role === 'Admin') return '#f56565';
      if (props.role === 'Teacher') return '#38b2ac';
      return '#4299e1';
    }};
  }
  
  .receiver-info {
    flex: 1;
    
    .receiver-name {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    .receiver-role {
      font-size: 0.8rem;
      color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
      display: flex;
      align-items: center;
      
      svg {
        margin-right: 0.25rem;
      }
    }
  }
`;

const ReceiverSearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const ChatBox = () => {
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  
  // New states for receiver selection
  const [receivers, setReceivers] = useState([]);
  const [loadingReceivers, setLoadingReceivers] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [showReceiverDropdown, setShowReceiverDropdown] = useState(false);
  const [receiverSearchTerm, setReceiverSearchTerm] = useState('');
  
  // Add these new state variables for pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Move fetchReceivers here to make it accessible to the component
  const fetchReceivers = async (currentPage = 1) => {
    try {
      setLoadingReceivers(true);
      console.log('Fetching receivers, page:', currentPage);
      
      // Giữ nguyên API call
      const response = await apiClient.get('/api/User/list', { 
        params: { 
          page: currentPage,
          pageSize: pageSize,
          role: 'Admin,Teacher' // Server có thể không xử lý tham số này
        } 
      });
      
      console.log('API response:', response.data);
      
      if (response && response.data) {
        // Xử lý phân trang
        if (response.data.totalPages !== undefined) {
          setTotalPages(response.data.totalPages);
        }
        
        if (response.data.totalCount !== undefined) {
          setTotalCount(response.data.totalCount);
        }
        
        if (response.data.page !== undefined) {
          setPage(response.data.page);
        }
        
        // Lấy danh sách người dùng
        let userData = [];
        if (response.data.data && Array.isArray(response.data.data)) {
          // Thêm lại bộ lọc để chỉ hiển thị Admin và Teacher
          userData = response.data.data.filter(user => 
            user.role === 'Admin' || user.role === 'Teacher'
          );
          
          console.log('Filtered users (Admin/Teacher only):', userData);
        }
        
        setReceivers(userData);
        
        // Thiết lập người nhận mặc định
        if (userData.length > 0 && !selectedReceiver) {
          setSelectedReceiver(userData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching receivers:', error.response || error);
      showErrorToast('Không thể tải danh sách người hỗ trợ');
    } finally {
      setLoadingReceivers(false);
    }
  };

  // Fetch available receivers (Teachers and Admins)
  useEffect(() => {
    fetchReceivers();
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowReceiverDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  
  
  // Fetch messages when selected receiver changes
  useEffect(() => {
    if (selectedReceiver) {
      fetchMessages();
    }
  }, [selectedReceiver]);
  
  const fetchMessages = async () => {
    if (!selectedReceiver) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getConversation(selectedReceiver.id);
      
      // Format the messages for UI
      if (Array.isArray(data) && data.length > 0) {
        const formattedMessages = data.map(msg => ({
          id: msg.id,
          sender: {
            id: msg.senderId,
            name: msg.senderName || (msg.senderId !== user?.id ? selectedReceiver.fullName : user?.fullName || 'Bạn'),
            role: msg.senderId !== user?.id ? selectedReceiver.role : 'user'
          },
          text: msg.content,
          time: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: msg.isRead
        }));
        
        setMessages(formattedMessages);
      } else {
        // Empty conversation
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };
  
  // Set up polling for new messages
  useEffect(() => {
    if (!selectedReceiver) return;
    
    const pollInterval = setInterval(async () => {
      try {
        // Check unread messages
        const unreadResponse = await getUnreadMessages();
        
        // Extract data array from the response
        let unreadData = [];
        if (unreadResponse && Array.isArray(unreadResponse)) {
          unreadData = unreadResponse;
        } else if (unreadResponse && Array.isArray(unreadResponse.data)) {
          unreadData = unreadResponse.data;
        } else {
          console.warn('Unread messages API did not return a valid format:', unreadResponse);
          return;
        }
        
        const data = await getConversation(selectedReceiver.id);
        
        if (Array.isArray(data)) {
          const formattedMessages = data.map(msg => ({
            id: msg.id,
            sender: {
              id: msg.senderId,
              name: msg.senderName || (msg.senderId !== user?.id ? selectedReceiver.fullName : user?.fullName || 'Bạn'),
              role: msg.senderId !== user?.id ? selectedReceiver.role : 'user'
            },
            text: msg.content,
            time: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: msg.isRead
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error checking for new messages:', error);
      }
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, [user, selectedReceiver]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedReceiver) return;
    
    // Create temporary message for UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: {
        id: user?.id,
        name: user?.fullName || 'Bạn',
        role: 'user'
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
      // Use selected receiver's ID
      const response = await sendChatMessage({
        content: newMessage,
        receiverId: selectedReceiver.id
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
  
  const handleReceiverSelect = (receiver) => {
    setSelectedReceiver(receiver);
    setShowReceiverDropdown(false);
    setReceiverSearchTerm('');
  };
  
  // Filter receivers based on search term
  const filteredReceivers = receiverSearchTerm 
    ? receivers.filter(r => 
        r.fullName?.toLowerCase().includes(receiverSearchTerm.toLowerCase()) || 
        r.username?.toLowerCase().includes(receiverSearchTerm.toLowerCase())
      )
    : receivers;
  
  // Get role icon for display
  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <FaUserShield />;
      case 'Teacher':
        return <FaChalkboardTeacher />;
      default:
        return <FaUser />;
    }
  };
  
  // Add function to handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchReceivers(newPage);
    }
  };
  
  return (
    <PageWrapper theme={theme}>
      <Container>
        <Title>Trung Tâm Hỗ Trợ</Title>
        <SupportInfo theme={theme}>
          <FaQuestionCircle style={{ marginRight: '0.5rem' }} />
          Tin nhắn của bạn sẽ được gửi đến đội ngũ hỗ trợ và sẽ được phản hồi trong thời gian sớm nhất.
        </SupportInfo>
        
        {/* Replace the dropdown with the new sidebar layout */}
        <ChatLayoutContainer>
          <UsersSidebar theme={theme}>
            <SidebarHeader theme={theme}>
              <FaHeadset style={{ marginRight: '0.5rem' }} />
              Danh sách hỗ trợ
            </SidebarHeader>
            
            <SidebarSearchInput
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={receiverSearchTerm}
              onChange={(e) => setReceiverSearchTerm(e.target.value)}
              theme={theme}
            />
            
            <UsersList theme={theme}>
              {loadingReceivers ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <LoadingSpinner size={20} />
                  <div>Đang tải danh sách...</div>
                </div>
              ) : filteredReceivers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: theme === 'dark' ? '#a0aec0' : '#718096' }}>
                  {receiverSearchTerm ? 'Không tìm thấy người dùng phù hợp' : 'Không có người hỗ trợ'}
                </div>
              ) : (
                filteredReceivers.map(receiver => (
                  <UserItem 
                    key={receiver.id}
                    theme={theme}
                    role={receiver.role}
                    $isSelected={selectedReceiver?.id === receiver.id}
                    onClick={() => handleReceiverSelect(receiver)}
                  >
                    <div className="user-avatar">
                      {getRoleIcon(receiver.role)}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{receiver.fullName || receiver.username}</div>
                      <div className="user-role">
                        {getRoleIcon(receiver.role)} {receiver.role}
                      </div>
                    </div>
                    <div className="status-indicator" title="Trạng thái" $isOnline={true} />
                  </UserItem>
                ))
              )}
            </UsersList>
            
            {totalPages > 1 && (
              <SidebarPagination theme={theme}>
                <button 
                  onClick={() => handlePageChange(page - 1)} 
                  disabled={page <= 1 || loadingReceivers}
                >
                  &larr; Trước
                </button>
                <span style={{ color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>
                  {page} / {totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(page + 1)} 
                  disabled={page >= totalPages || loadingReceivers}
                >
                  Sau &rarr;
                </button>
              </SidebarPagination>
            )}
          </UsersSidebar>
          
          <ChatContainer theme={theme}>
            <ChatHeader theme={theme}>
              <Title theme={theme}>
                <FaHeadset style={{ marginRight: '0.75rem' }} />
                {selectedReceiver 
                  ? `Trò chuyện với ${selectedReceiver.fullName || selectedReceiver.username}`
                  : 'Hệ thống hỗ trợ'
                }
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
              ) : !selectedReceiver ? (
                <EmptyState theme={theme}>
                  <FaUserCircle size={48} />
                  <h3>Chưa chọn người nhận</h3>
                  <p>Vui lòng chọn giáo viên hoặc quản trị viên từ danh sách để bắt đầu cuộc trò chuyện.</p>
                </EmptyState>
              ) : messages.length === 0 ? (
                <EmptyState theme={theme}>
                  <FaUserCircle size={48} />
                  <h3>Không có tin nhắn</h3>
                  <p>Hãy bắt đầu cuộc trò chuyện với {selectedReceiver.fullName || selectedReceiver.username}.</p>
                </EmptyState>
              ) : (
                messages.map(message => (
                  <MessageBubble 
                      key={message.id} 
                      $isOutgoing={message.sender.id === user?.id}
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
            </MessagesContainer>
            
            <InputContainer theme={theme}>
              <MessageInput
                type="text"
                placeholder={selectedReceiver 
                  ? `Nhắn tin cho ${selectedReceiver.fullName || selectedReceiver.username}...` 
                  : "Chọn người nhận trước khi nhắn tin..."
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                theme={theme}
                disabled={loading || !selectedReceiver}
              />
              <SendButton 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || loading || !selectedReceiver}
              >
                <FaPaperPlane />
                Gửi
              </SendButton>
            </InputContainer>
          </ChatContainer>
        </ChatLayoutContainer>
      </Container>
    </PageWrapper>
  );
};

export default ChatBox;