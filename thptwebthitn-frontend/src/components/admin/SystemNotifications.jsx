import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaBell, FaEnvelope, FaUsers, FaUserGraduate, 
  FaChalkboardTeacher, FaUserCog, FaTimes, 
  FaPaperPlane, FaSave, FaEye, FaHistory
} from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchUsers } from '../../redux/userSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  color: ${props => props.active 
    ? props.theme === 'dark' ? '#4299e1' : '#3182ce' 
    : props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.active 
      ? props.theme === 'dark' ? '#4299e1' : '#3182ce' 
      : 'transparent'};
  }
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#4299e1' : '#3182ce'};
  }
  
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Card = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const InfoText = styled.p`
  margin-top: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.875rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background-color: ${props => props.primary 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  color: ${props => props.primary 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:hover {
    background-color: ${props => props.primary 
      ? '#3182ce' 
      : props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 2rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  padding: 1.5rem;
`;

const PreviewTitle = styled.h3`
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NotificationList = styled.div`
  margin-top: 1rem;
`;

const NotificationItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const NotificationDate = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const NotificationContent = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 0.875rem;
  
  p {
    margin: 0;
  }
`;

const NotificationInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

const NotificationType = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: ${props => 
    props.type === 'email' 
      ? props.theme === 'dark' ? '#2C7A7B' : '#B2F5EA'
      : props.theme === 'dark' ? '#2A4365' : '#BEE3F8'};
  color: ${props => 
    props.type === 'email'
      ? props.theme === 'dark' ? '#E6FFFA' : '#234E52'
      : props.theme === 'dark' ? '#EBF8FF' : '#2A4365'};
`;

const RecipientType = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: ${props => {
    if (props.recipient === 'all') {
      return props.theme === 'dark' ? '#4A5568' : '#E2E8F0';
    }
    if (props.recipient === 'students') {
      return props.theme === 'dark' ? '#2C7A7B' : '#B2F5EA';
    }
    if (props.recipient === 'teachers') {
      return props.theme === 'dark' ? '#2A4365' : '#BEE3F8';
    }
    return props.theme === 'dark' ? '#44337A' : '#E9D8FD';
  }};
  color: ${props => {
    if (props.recipient === 'all') {
      return props.theme === 'dark' ? '#E2E8F0' : '#1A202C';
    }
    if (props.recipient === 'students') {
      return props.theme === 'dark' ? '#E6FFFA' : '#234E52';
    }
    if (props.recipient === 'teachers') {
      return props.theme === 'dark' ? '#EBF8FF' : '#2A4365';
    }
    return props.theme === 'dark' ? '#FAF5FF' : '#44337A';
  }};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const CustomQuillWrapper = styled.div`
  .ql-toolbar {
    border-radius: 0.375rem 0.375rem 0 0;
    border-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'} !important;
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  }
  
  .ql-container {
    min-height: 200px;
    border-radius: 0 0 0.375rem 0.375rem;
    border-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'} !important;
    background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  }
  
  .ql-editor {
    min-height: 200px;
    font-family: inherit;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  .ql-picker {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'} !important;
  }
  
  .ql-stroke {
    stroke: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'} !important;
  }
  
  .ql-fill {
    fill: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'} !important;
  }
  
  .ql-picker-options {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'} !important;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'} !important;
  }
`;

const PreviewPopup = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 500px;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PopupTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const PopupCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

const PopupContent = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 1rem;
`;

const PopupButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  background-color: #4299e1;
  color: white;
  cursor: pointer;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const SystemNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  // States
  const [activeTab, setActiveTab] = useState('create');
  const [notificationType, setNotificationType] = useState('popup');
  const [recipientType, setRecipientType] = useState('all');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  
  // Mock data for history - in a real app, this would come from an API
  useEffect(() => {
    if (activeTab === 'history') {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setSentNotifications([
          {
            id: 1,
            title: 'Thông báo lịch thi cuối kỳ',
            content: '<p>Các em học sinh lưu ý lịch thi cuối kỳ 2 sẽ bắt đầu từ ngày 10/06/2023.</p>',
            type: 'email',
            recipientType: 'students',
            createdAt: '2023-05-25T08:30:00',
            sentCount: 120
          },
          {
            id: 2,
            title: 'Cập nhật hệ thống',
            content: '<p>Hệ thống sẽ bảo trì vào tối ngày 29/05/2023, từ 22:00 đến 24:00.</p>',
            type: 'popup',
            recipientType: 'all',
            createdAt: '2023-05-28T16:45:00',
            sentCount: 250
          },
          {
            id: 3,
            title: 'Thông báo họp giáo viên',
            content: '<p>Mời quý thầy cô tham dự buổi họp vào lúc 14:00 ngày 02/06/2023 tại phòng hội đồng.</p>',
            type: 'email',
            recipientType: 'teachers',
            createdAt: '2023-06-01T10:15:00',
            sentCount: 45
          }
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [activeTab]);
  
  const handleSubmit = async () => {
    // Validate form
    if (!title.trim()) {
      showErrorToast('Vui lòng nhập tiêu đề thông báo');
      return;
    }
    
    if (!content.trim()) {
      showErrorToast('Vui lòng nhập nội dung thông báo');
      return;
    }
    
    setIsSending(true);
    
    try {
      // In a real app, this would be an API call
      // const response = await sendSystemNotification({
      //   title,
      //   content,
      //   type: notificationType,
      //   recipientType,
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccessToast(`Gửi thông báo ${notificationType === 'email' ? 'email' : 'popup'} thành công!`);
      
      // Reset form
      setTitle('');
      setContent('');
      
      // Switch to history tab
      setActiveTab('history');
    } catch (error) {
      console.error('Error sending notification:', error);
      showErrorToast('Có lỗi xảy ra khi gửi thông báo');
    } finally {
      setIsSending(false);
    }
  };
  
  const handlePreview = () => {
    if (!title.trim()) {
      showErrorToast('Vui lòng nhập tiêu đề thông báo để xem trước');
      return;
    }
    
    if (!content.trim()) {
      showErrorToast('Vui lòng nhập nội dung thông báo để xem trước');
      return;
    }
    
    setShowPreview(true);
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  const getRecipientLabel = (type) => {
    switch (type) {
      case 'all': return 'Tất cả';
      case 'students': return 'Học sinh';
      case 'teachers': return 'Giáo viên';
      case 'admins': return 'Quản trị viên';
      default: return 'Không xác định';
    }
  };
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>
          <FaBell /> Thông báo hệ thống
        </Title>
        <Subtitle theme={theme}>Gửi thông báo đến người dùng qua email hoặc hiển thị popup trong hệ thống</Subtitle>
      </Header>
      
      <TabContainer theme={theme}>
        <Tab 
          theme={theme} 
          active={activeTab === 'create'} 
          onClick={() => setActiveTab('create')}
        >
          <FaPaperPlane /> Tạo thông báo mới
        </Tab>
        <Tab 
          theme={theme} 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
        >
          <FaHistory /> Lịch sử thông báo
        </Tab>
      </TabContainer>
      
      {activeTab === 'create' ? (
        <Card theme={theme}>
          <CardHeader theme={theme}>
            <CardTitle theme={theme}>
              <FaBell /> Tạo thông báo mới
            </CardTitle>
          </CardHeader>
          <CardBody>
            <FormGroup>
              <Label theme={theme}>Loại thông báo</Label>
              <RadioGroup>
                <RadioLabel theme={theme}>
                  <input
                    type="radio"
                    name="notificationType"
                    value="popup"
                    checked={notificationType === 'popup'}
                    onChange={() => setNotificationType('popup')}
                  />
                  <FaBell /> Popup trên hệ thống
                </RadioLabel>
                <RadioLabel theme={theme}>
                  <input
                    type="radio"
                    name="notificationType"
                    value="email"
                    checked={notificationType === 'email'}
                    onChange={() => setNotificationType('email')}
                  />
                  <FaEnvelope /> Email
                </RadioLabel>
              </RadioGroup>
              <InfoText theme={theme}>
                {notificationType === 'popup' 
                  ? 'Thông báo sẽ hiển thị dưới dạng popup khi người dùng đăng nhập vào hệ thống' 
                  : 'Thông báo sẽ được gửi đến email của người dùng'}
              </InfoText>
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Người nhận</Label>
              <Select 
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value)}
                theme={theme}
              >
                <option value="all">Tất cả người dùng</option>
                <option value="students">Học sinh</option>
                <option value="teachers">Giáo viên</option>
                <option value="admins">Quản trị viên</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Tiêu đề thông báo</Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo"
                theme={theme}
              />
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Nội dung thông báo</Label>
              <CustomQuillWrapper theme={theme}>
                <ReactQuill 
                  value={content} 
                  onChange={setContent}
                  placeholder="Nhập nội dung thông báo..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'color': [] }, { 'background': [] }],
                      ['link'],
                      ['clean']
                    ],
                  }}
                />
              </CustomQuillWrapper>
            </FormGroup>
            
            {showPreview && (
              <PreviewContainer theme={theme}>
                <PreviewTitle theme={theme}>
                  <FaEye /> Xem trước
                </PreviewTitle>
                
                {notificationType === 'popup' ? (
                  <PreviewPopup theme={theme}>
                    <PopupHeader>
                      <PopupTitle theme={theme}>{title}</PopupTitle>
                      <PopupCloseButton theme={theme}>
                        <FaTimes />
                      </PopupCloseButton>
                    </PopupHeader>
                    <PopupContent theme={theme} dangerouslySetInnerHTML={{ __html: content }} />
                    <PopupButton>Đã hiểu</PopupButton>
                  </PreviewPopup>
                ) : (
                  <div>
                    <p><strong>Từ:</strong> Hệ thống thi trực tuyến THPT</p>
                    <p><strong>Tới:</strong> {getRecipientLabel(recipientType)}</p>
                    <p><strong>Tiêu đề:</strong> {title}</p>
                    <p><strong>Nội dung:</strong></p>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  </div>
                )}
              </PreviewContainer>
            )}
          </CardBody>
          <CardFooter theme={theme}>
            <Button theme={theme} onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? <FaTimes /> : <FaEye />} {showPreview ? 'Đóng xem trước' : 'Xem trước'}
            </Button>
            <Button 
              primary 
              onClick={handleSubmit}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <LoadingSpinner size={16} color="white" /> Đang gửi...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Gửi thông báo
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card theme={theme}>
          <CardHeader theme={theme}>
            <CardTitle theme={theme}>
              <FaHistory /> Lịch sử thông báo
            </CardTitle>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <LoadingSpinner size={40} />
              </div>
            ) : sentNotifications.length === 0 ? (
              <EmptyState theme={theme}>
                <FaBell size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Chưa có thông báo nào được gửi</p>
              </EmptyState>
            ) : (
              <NotificationList>
                {sentNotifications.map(notification => (
                  <NotificationItem key={notification.id} theme={theme}>
                    <NotificationHeader>
                      <NotificationTitle theme={theme}>{notification.title}</NotificationTitle>
                      <NotificationDate theme={theme}>{formatDate(notification.createdAt)}</NotificationDate>
                    </NotificationHeader>
                    <NotificationContent 
                      theme={theme} 
                      dangerouslySetInnerHTML={{ __html: notification.content }} 
                    />
                    <NotificationInfo>
                      <div>
                        <NotificationType theme={theme} type={notification.type}>
                          {notification.type === 'email' ? 'Email' : 'Popup'}
                        </NotificationType>{' '}
                        <RecipientType theme={theme} recipient={notification.recipientType}>
                          {getRecipientLabel(notification.recipientType)}
                        </RecipientType>
                      </div>
                      <span>Đã gửi: {notification.sentCount} người nhận</span>
                    </NotificationInfo>
                  </NotificationItem>
                ))}
              </NotificationList>
            )}
          </CardBody>
        </Card>
      )}
    </Container>
  );
};

export default SystemNotifications;