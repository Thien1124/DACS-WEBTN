import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner, 
  Row, 
  Col 
} from 'react-bootstrap';
import { FaBell, FaEnvelope, FaLink, FaTags, FaInfoCircle } from 'react-icons/fa';
import NotificationService from '../../services/NotificationService';

// Styled components for custom elements
const StyledCard = styled(Card)`
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  color: ${props => props.theme === 'dark' ? '#f1f1f1' : 'inherit'};
`;

const CardHeader = styled(Card.Header)`
  background-color: ${props => props.theme === 'dark' ? '#383838' : '#f8f9fa'};
  border-bottom: ${props => props.theme === 'dark' ? '1px solid #444' : '1px solid #e5e5e5'};
  padding: 1.25rem;
`;

const CardTitle = styled.h2`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? 'white' : 'inherit'};
`;

const FormLabel = styled(Form.Label)`
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e0e0e0' : 'inherit'};
`;

const FormControl = styled(Form.Control)`
  padding: 10px 15px;
  border-radius: 6px;
  border: ${props => props.theme === 'dark' ? '1px solid #555' : '1px solid #ced4da'};
  background-color: ${props => props.theme === 'dark' ? '#383838' : 'white'};
  color: ${props => props.theme === 'dark' ? 'white' : 'inherit'};
  
  &:focus {
    box-shadow: 0 0 0 0.25rem ${props => props.theme === 'dark' ? 'rgba(90, 114, 239, 0.25)' : 'rgba(13, 110, 253, 0.25)'};
    border-color: ${props => props.theme === 'dark' ? '#5A72EF' : '#86b7fe'};
    background-color: ${props => props.theme === 'dark' ? '#383838' : 'white'};
    color: ${props => props.theme === 'dark' ? 'white' : 'inherit'};
  }
`;

const StyledFormSelect = styled(Form.Select)`
  padding: 10px 15px;
  border-radius: 6px;
  border: ${props => props.theme === 'dark' ? '1px solid #555' : '1px solid #ced4da'};
  background-color: ${props => props.theme === 'dark' ? '#383838' : 'white'};
  color: ${props => props.theme === 'dark' ? 'white' : 'inherit'};
  
  &:focus {
    box-shadow: 0 0 0 0.25rem ${props => props.theme === 'dark' ? 'rgba(90, 114, 239, 0.25)' : 'rgba(13, 110, 253, 0.25)'};
    border-color: ${props => props.theme === 'dark' ? '#5A72EF' : '#86b7fe'};
    background-color: ${props => props.theme === 'dark' ? '#383838' : 'white'};
    color: ${props => props.theme === 'dark' ? 'white' : 'inherit'};
  }
`;

const SubmitButton = styled(Button)`
  padding: 10px 20px;
  font-weight: 500;
  min-width: 150px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: ${props => props.theme === 'dark' ? '1px solid #444' : '1px solid #eee'};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h5`
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#adb5bd' : '#6c757d'};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContentTextArea = styled(FormControl)`
  min-height: 120px;
  line-height: 1.5;
  resize: vertical;
  transition: min-height 0.2s ease;
  margin-bottom: 0.5rem;
  font-family: 'Roboto', sans-serif;
  width: 100%; /* Ensure full width */
  max-width: 100%; /* Prevent overflow */
  box-sizing: border-box; /* Include padding in width calculation */
  
  &:focus {
    min-height: 150px;
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 0.8rem;
  color: ${props => {
    if (props.count > props.limit * 0.9) return props.theme === 'dark' ? '#ff6b6b' : '#dc3545';
    if (props.count > props.limit * 0.7) return props.theme === 'dark' ? '#ffa94d' : '#fd7e14';
    return props.theme === 'dark' ? '#adb5bd' : '#6c757d';
  }};
  margin-top: -5px;
  margin-bottom: 0.5rem;
`;

const ContentHelpText = styled(Form.Text)`
  color: ${props => props.theme === 'dark' ? '#adb5bd' : '#6c757d'};
  margin-top: 0.25rem;
  display: block;
`;

const ContentWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%; /* Ensure the wrapper takes full width */
  padding-right: 0; /* Remove any right padding */
  padding-left: 0; /* Remove any left padding */
`;

const NotificationSender = () => {
  const { token } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const [formData, setFormData] = useState({
    userIds: [],
    title: '',
    content: '',
    type: 0,
    link: '',
    relatedEntityId: null,
    relatedEntityType: '',
    sendEmail: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'userIds' && type === 'text' 
          ? value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          : name === 'relatedEntityId' && value === ''
            ? null
            : name === 'relatedEntityId'
              ? parseInt(value)
              : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await NotificationService.sendInAppNotification(token, formData);
      setSuccess(true);
      setFormData({
        userIds: [],
        title: '',
        content: '',
        type: 0,
        link: '',
        relatedEntityId: null,
        relatedEntityType: '',
        sendEmail: false
      });
    } catch (err) {
      setError('Không thể gửi thông báo. Vui lòng thử lại.');
      console.error('Error sending notification:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const notificationTypes = [
    { value: 0, label: 'Hệ thống', variant: 'info' },
    { value: 1, label: 'Kỳ thi', variant: 'primary' },
    { value: 2, label: 'Kết quả', variant: 'success' },
    { value: 3, label: 'Cảnh báo', variant: 'warning' }
  ];
  
  return (
    <Container className="py-4">
      <StyledCard theme={theme}>
        <CardHeader theme={theme}>
          <CardTitle theme={theme}>
            <FaBell /> Gửi thông báo
          </CardTitle>
        </CardHeader>
        
        <Card.Body>
          {success && (
            <Alert variant="success" className="d-flex align-items-center">
              <div className="me-3">✅</div>
              <div>Đã gửi thông báo thành công!</div>
            </Alert>
          )}
          
          {error && (
            <Alert variant="danger" className="d-flex align-items-center">
              <div className="me-3">❌</div>
              <div>{error}</div>
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <FormSection theme={theme}>
              <SectionTitle theme={theme}>
                <FaBell /> Thông tin cơ bản
              </SectionTitle>
              
              <Form.Group className="mb-3">
                <FormLabel theme={theme}>ID người dùng (nhiều ID cách nhau bằng dấu phẩy)</FormLabel>
                <FormControl
                  theme={theme}
                  type="text"
                  name="userIds"
                  value={formData.userIds.join(', ')}
                  onChange={handleChange}
                  placeholder="VD: 1, 2, 3"
                  required
                />
                <Form.Text className="text-muted">
                  Nhập ID của người dùng, ngăn cách bằng dấu phẩy
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <FormLabel theme={theme}>Tiêu đề</FormLabel>
                <FormControl
                  theme={theme}
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Tiêu đề thông báo"
                  required
                />
              </Form.Group>
              
              <ContentWrapper>
                <FormLabel theme={theme}>Nội dung thông báo</FormLabel>
                <ContentTextArea
                  theme={theme}
                  as="textarea"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Nhập nội dung chi tiết của thông báo tại đây..."
                  required
                  rows={5}
                />
                <CharacterCount 
                  theme={theme} 
                  count={formData.content.length} 
                  limit={500}
                >
                  {formData.content.length}/500 ký tự
                </CharacterCount>
                <ContentHelpText theme={theme}>
                  <FaInfoCircle className="me-1" size={14} />
                  Viết nội dung ngắn gọn, rõ ràng để người dùng dễ hiểu.
                </ContentHelpText>
              </ContentWrapper>
            </FormSection>
            
            <FormSection theme={theme}>
              <SectionTitle theme={theme}>
                <FaTags /> Cấu hình thông báo
              </SectionTitle>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <FormLabel theme={theme}>Loại thông báo</FormLabel>
                    <StyledFormSelect 
                      theme={theme}
                      name="type" 
                      value={formData.type} 
                      onChange={handleChange}
                    >
                      {notificationTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </StyledFormSelect>
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Form.Group className="mb-3 mt-3 mt-md-0 w-100">
                    <Form.Check 
                      type="switch"
                      id="sendEmail"
                      name="sendEmail"
                      label={
                        <span className="d-flex align-items-center">
                          <FaEnvelope className="me-2" /> Gửi kèm email
                        </span>
                      }
                      checked={formData.sendEmail}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </FormSection>
            
            <FormSection theme={theme}>
              <SectionTitle theme={theme}>
                <FaLink /> Thông tin liên kết (tùy chọn)
              </SectionTitle>
              
              <Form.Group className="mb-3">
                <FormLabel theme={theme}>Liên kết</FormLabel>
                <FormControl
                  theme={theme}
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="/duong-dan-lien-ket"
                />
                <Form.Text className="text-muted">
                  Đường dẫn để điều hướng khi người dùng nhấp vào thông báo
                </Form.Text>
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <FormLabel theme={theme}>ID đối tượng liên quan</FormLabel>
                    <FormControl
                      theme={theme}
                      type="number"
                      name="relatedEntityId"
                      value={formData.relatedEntityId || ''}
                      onChange={handleChange}
                      placeholder="ID của kỳ thi hoặc kết quả"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <FormLabel theme={theme}>Loại đối tượng</FormLabel>
                    <FormControl
                      theme={theme}
                      type="text"
                      name="relatedEntityType"
                      value={formData.relatedEntityType}
                      onChange={handleChange}
                      placeholder="VD: exam, result"
                    />
                    <Form.Text className="text-muted">
                      Loại đối tượng liên quan như: exam, result
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </FormSection>
            
            <div className="d-flex justify-content-end mt-4">
              <SubmitButton 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi thông báo'
                )}
              </SubmitButton>
            </div>
          </Form>
        </Card.Body>
      </StyledCard>
    </Container>
  );
};

export default NotificationSender;