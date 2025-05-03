import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPaperPlane, 
  FaUserCircle, 
  FaChevronDown,
  FaTimes,
  FaBell,
  FaUserShield,
  FaChalkboardTeacher
} from 'react-icons/fa';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LoadingSpinner from '../common/LoadingSpinner';

// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1.5rem;
  width: 100%;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 70vh;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

const RecipientSelector = styled.div`
  position: relative;
`;

const SelectorButton = styled.button`
  display: flex;
  align-items: center;
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  cursor: pointer;
  
  svg {
    margin-left: 0.5rem;
  }
`;

const RecipientDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const RecipientOption = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.role === 'admin' ? '#e53e3e' : '#4299e1'};
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
  color: ${props => props.isOutgoing 
    ? (props.theme === 'dark' ? '#1a202c' : '#ffffff')
    : (props.theme === 'dark' ? '#e2e8f0' : '#2d3748')};
  background-color: ${props => props.isOutgoing 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  align-self: ${props => props.isOutgoing ? 'flex-end' : 'flex-start'};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    ${props => props.isOutgoing ? 'right' : 'left'}: -10px;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-top-color: ${props => props.isOutgoing 
      ? '#4299e1' 
      : props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
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

const ChatBox = () => {
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [recipient, setRecipient] = useState({ id: 'admin', name: 'Admin', role: 'admin' });
  
  const messagesEndRef = useRef(null);
  
  // Mock teachers list
  const teachers = [
    { id: 'teacher1', name: 'Nguyễn Văn A', role: 'teacher' },
    { id: 'teacher2', name: 'Trần Thị B', role: 'teacher' },
    { id: 'teacher3', name: 'Lê Văn C', role: 'teacher' }
  ];
  
  // Dummy data for demonstration
  useEffect(() => {
    // Simulating loading messages
    setLoading(true);
    
    // This would be replaced with an actual API call in a real app
    setTimeout(() => {
      if (recipient.id === 'admin') {
        setMessages([
          {
            id: 1,
            sender: { id: 'admin', name: 'Admin', role: 'admin' },
            text: 'Xin chào, tôi có thể giúp gì cho bạn?',
            time: '10:00 AM',
            isRead: true
          }
        ]);
      } else {
        setMessages([
          {
            id: 1,
            sender: { id: recipient.id, name: recipient.name, role: recipient.role },
            text: `Xin chào, tôi là ${recipient.name}. Bạn cần giúp đỡ gì?`,
            time: '10:05 AM',
            isRead: true
          }
        ]);
      }
      
      setLoading(false);
    }, 1000);
  }, [recipient]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: user,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate response after a short delay
    setTimeout(() => {
      const responseMessage = {
        id: messages.length + 2,
        sender: recipient,
        text: `Cảm ơn tin nhắn của bạn. Chúng tôi sẽ phản hồi sớm nhất có thể.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 1500);
  };
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container>
        <Title>Hộp thoại hỗ trợ</Title>
        <ChatContainer theme={theme}>
          <ChatHeader theme={theme}>
            <Title theme={theme}>
              {recipient.role === 'admin' ? <FaUserShield /> : <FaChalkboardTeacher />}
              {recipient.name}
            </Title>
            <RecipientSelector>
              <SelectorButton theme={theme} onClick={() => setShowDropdown(!showDropdown)}>
                Đổi người nhận
                <FaChevronDown />
              </SelectorButton>
              
              <AnimatePresence>
                {showDropdown && (
                  <RecipientDropdown
                    theme={theme}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RecipientOption 
                      theme={theme} 
                      role="admin"
                      onClick={() => {
                        setRecipient({ id: 'admin', name: 'Admin', role: 'admin' });
                        setShowDropdown(false);
                      }}
                    >
                      <FaUserShield /> Admin
                    </RecipientOption>
                    
                    {teachers.map(teacher => (
                      <RecipientOption 
                        key={teacher.id} 
                        theme={theme}
                        role="teacher"
                        onClick={() => {
                          setRecipient(teacher);
                          setShowDropdown(false);
                        }}
                      >
                        <FaChalkboardTeacher /> {teacher.name}
                      </RecipientOption>
                    ))}
                  </RecipientDropdown>
                )}
              </AnimatePresence>
            </RecipientSelector>
          </ChatHeader>
          
          <MessagesContainer theme={theme}>
            {loading ? (
              <EmptyState theme={theme}>
                <LoadingSpinner size={30} />
                <p>Đang tải tin nhắn...</p>
              </EmptyState>
            ) : messages.length === 0 ? (
              <EmptyState theme={theme}>
                <FaUserCircle size={48} />
                <h3>Không có tin nhắn</h3>
                <p>Hãy bắt đầu cuộc trò chuyện để được hỗ trợ.</p>
              </EmptyState>
            ) : (
              messages.map(message => (
                <MessageBubble 
                  key={message.id} 
                  isOutgoing={message.sender.id === user?.id}
                  theme={theme}
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
                      {message.isRead ? 'Đã xem' : 'Đã gửi'}
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
            />
            <SendButton 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim()}
            >
              <FaPaperPlane />
              Gửi
            </SendButton>
          </InputContainer>
        </ChatContainer>
      </Container>
      <Footer />
    </PageWrapper>
  );
};

export default ChatBox;