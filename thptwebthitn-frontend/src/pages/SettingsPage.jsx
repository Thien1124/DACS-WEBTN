import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; // Thêm import useSelector
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaLock, FaPalette, FaInfoCircle } from 'react-icons/fa';
import { changePassword, getSystemInfo } from '../services/userService';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Media queries tùy chỉnh với breakpoints lớn hơn cho desktop
const breakpoints = {
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px'
};

const respondTo = Object.keys(breakpoints).reduce((acc, label) => {
  acc[label] = (...args) => `
    @media (min-width: ${breakpoints[label]}) {
      ${args[0]};
    }
  `;
  return acc;
}, {});

const respondBelow = {
  sm: (content) => `@media (max-width: 576px) { ${content} }`,
  md: (content) => `@media (max-width: 768px) { ${content} }`,
  lg: (content) => `@media (max-width: 992px) { ${content} }`,
  xl: (content) => `@media (max-width: 1200px) { ${content} }`
};

// Styled components với kích thước lớn hơn cho desktop
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
`;

const PageContainer = styled.div`
  max-width: 1200px; /* Tăng kích thước container */
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
`;

const SettingsLayout = styled.div`
  display: flex;
  gap: 30px;

  ${respondBelow.lg`
    flex-direction: column;
  `}
`;

const Sidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  background: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  align-self: flex-start;
  position: sticky;
  top: 2rem;

  ${respondBelow.lg`
    width: 100%;
    position: static;
  `}
`;

const ContentArea = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: ${props => props.active 
    ? (props.theme === 'dark' ? '#4a5568' : '#ebf8ff') 
    : 'transparent'};
  border: none;
  border-radius: 6px;
  color: ${props => props.active 
    ? (props.theme === 'dark' ? '#90cdf4' : '#3182ce') 
    : (props.theme === 'dark' ? '#e2e8f0' : '#4a5568')};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;

  svg {
    margin-right: 10px;
    font-size: 1.2rem;
  }

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4a5568' : '#ebf8ff'};
    color: ${props => props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
  }
`;

const Section = styled(motion.div)`
  background: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  padding: 2.5rem; /* Thêm padding */
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px; /* Giới hạn chiều rộng form */
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 500;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 0.85rem 1rem; /* Tăng kích thước input */
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 6px;
  background: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  }
`;

const Button = styled.button`
  padding: 0.85rem 1.5rem; /* Tăng kích thước button */
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content; /* Đảm bảo nút không chiếm full width */

  &:hover {
    background: #2c5282;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ThemeButton = styled(Button)`
  background: ${props => props.isActive ? '#3182ce' : (props.theme === 'dark' ? '#4a5568' : '#e2e8f0')};
  color: ${props => props.isActive ? 'white' : (props.theme === 'dark' ? '#e2e8f0' : '#4a5568')};
  padding: 1rem 2rem;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.isActive ? '#2c5282' : '#3182ce'};
    color: white;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  margin-top: 0.5rem;
  font-size: 0.95rem;
  padding: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? 'rgba(229, 62, 62, 0.1)' : 'rgba(229, 62, 62, 0.1)'};
  border-radius: 6px;
  border-left: 3px solid #e53e3e;
`;

const SuccessMessage = styled.div`
  color: #38a169;
  margin-top: 0.5rem;
  font-size: 0.95rem;
  padding: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? 'rgba(56, 161, 105, 0.1)' : 'rgba(56, 161, 105, 0.1)'};
  border-radius: 6px;
  border-left: 3px solid #38a169;
`;

const SystemInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const InfoCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const InfoLabel = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
`;

const InfoValue = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 600;
  font-size: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
`;

const SettingsPage = () => {
  const user = useSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState('password');
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [systemInfo, setSystemInfo] = useState(null);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Lấy theme từ localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    if (activeTab === 'system') {
      fetchSystemInfo();
    }
  }, [activeTab]);
  
  const onThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const data = await getSystemInfo();
      setSystemInfo(data);
    } catch (err) {
      setError('Không thể lấy thông tin hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess('Đổi mật khẩu thành công');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordSection = () => (
    <Section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      theme={theme}
    >
      <SectionTitle theme={theme}>Đổi mật khẩu</SectionTitle>
      <Form onSubmit={handlePasswordChange}>
        <FormGroup>
          <Label theme={theme}>Mật khẩu hiện tại</Label>
          <Input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({
              ...passwordForm,
              currentPassword: e.target.value
            })}
            required
            theme={theme}
          />
        </FormGroup>
        
        <FormGroup>
          <Label theme={theme}>Mật khẩu mới</Label>
          <Input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({
              ...passwordForm,
              newPassword: e.target.value
            })}
            required
            theme={theme}
          />
        </FormGroup>
        
        <FormGroup>
          <Label theme={theme}>Xác nhận mật khẩu mới</Label>
          <Input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({
              ...passwordForm,
              confirmPassword: e.target.value
            })}
            required
            theme={theme}
          />
        </FormGroup>

        {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
        {success && <SuccessMessage theme={theme}>{success}</SuccessMessage>}
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </Button>
      </Form>
    </Section>
  );

  const renderThemeSection = () => (
    <Section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      theme={theme}
    >
      <SectionTitle theme={theme}>Giao diện</SectionTitle>
      <FormGroup>
        <Label theme={theme}>Chọn chế độ hiển thị</Label>
        <ButtonGroup>
          <ThemeButton
            onClick={() => onThemeChange('light')}
            isActive={theme === 'light'}
            theme={theme}
            type="button"
          >
            Sáng
          </ThemeButton>
          <ThemeButton
            onClick={() => onThemeChange('dark')}
            isActive={theme === 'dark'}
            theme={theme}
            type="button"
          >
            Tối
          </ThemeButton>
        </ButtonGroup>
      </FormGroup>
    </Section>
  );

  const renderSystemSection = () => (
    <Section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      theme={theme}
    >
      <SectionTitle theme={theme}>Thông tin hệ thống</SectionTitle>
      {loading ? (
        <LoadingContainer>
          <LoadingSpinner size={40} />
        </LoadingContainer>
      ) : systemInfo ? (
        <SystemInfoGrid>
          <InfoCard theme={theme}>
            <InfoLabel theme={theme}>Phiên bản</InfoLabel>
            <InfoValue theme={theme}>{systemInfo.version || '1.0.0'}</InfoValue>
          </InfoCard>
          <InfoCard theme={theme}>
            <InfoLabel theme={theme}>Số người dùng</InfoLabel>
            <InfoValue theme={theme}>{systemInfo.totalUsers || 0}</InfoValue>
          </InfoCard>
          <InfoCard theme={theme}>
            <InfoLabel theme={theme}>Số môn học</InfoLabel>
            <InfoValue theme={theme}>{systemInfo.totalSubjects || 0}</InfoValue>
          </InfoCard>
          <InfoCard theme={theme}>
            <InfoLabel theme={theme}>Số đề thi</InfoLabel>
            <InfoValue theme={theme}>{systemInfo.totalExams || 0}</InfoValue>
          </InfoCard>
        </SystemInfoGrid>
      ) : (
        <ErrorMessage theme={theme}>{error || 'Không thể tải thông tin hệ thống'}</ErrorMessage>
      )}
    </Section>
  );

  return (
    <PageWrapper theme={theme}>
      <PageContainer>
        <Title theme={theme}>Cài đặt tài khoản</Title>
        
        <SettingsLayout>
          <Sidebar theme={theme}>
            <NavButton
              active={activeTab === 'password'}
              onClick={() => setActiveTab('password')}
              theme={theme}
            >
              <FaLock /> Đổi mật khẩu
            </NavButton>
            <NavButton
              active={activeTab === 'theme'}
              onClick={() => setActiveTab('theme')}
              theme={theme}
            >
              <FaPalette /> Giao diện
            </NavButton>
            <NavButton
              active={activeTab === 'system'}
              onClick={() => setActiveTab('system')}
              theme={theme}
            >
              <FaInfoCircle /> Thông tin hệ thống
            </NavButton>
          </Sidebar>

          <ContentArea>
            {activeTab === 'password' && renderPasswordSection()}
            {activeTab === 'theme' && renderThemeSection()}
            {activeTab === 'system' && renderSystemSection()}
          </ContentArea>
        </SettingsLayout>
      </PageContainer>
    </PageWrapper>
  );
};

export default SettingsPage;