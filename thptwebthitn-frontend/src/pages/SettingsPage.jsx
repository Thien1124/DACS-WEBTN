import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaLock, FaPalette, FaInfoCircle } from 'react-icons/fa';
import { changePassword, getSystemInfo } from '../services/userService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
`;

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const TabButton = styled.button`
  padding: 1rem 2rem;
  background: none;
  border: none;
  color: ${props => props.active ? '#3182ce' : props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${props => props.active ? '#3182ce' : 'transparent'};
    transition: background-color 0.3s ease;
  }

  &:hover {
    color: #3182ce;
  }
`;

const Section = styled(motion.div)`
  background: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 4px;
  background: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #2c5282;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  color: #38a169;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const SystemInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const InfoCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  padding: 1rem;
  border-radius: 4px;
`;

const InfoLabel = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 600;
`;

const SettingsPage = ({ theme, onThemeChange }) => {  // Đổi tên từ Settings thành SettingsPage
  const user = useSelector(state => state.auth.user);
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
    if (activeTab === 'system') {
      fetchSystemInfo();
    }
  }, [activeTab]);
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
    >
      <Form onSubmit={handlePasswordChange}>
        <FormGroup>
          <Label>Mật khẩu hiện tại</Label>
          <Input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({
              ...passwordForm,
              currentPassword: e.target.value
            })}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Mật khẩu mới</Label>
          <Input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({
              ...passwordForm,
              newPassword: e.target.value
            })}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Xác nhận mật khẩu mới</Label>
          <Input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({
              ...passwordForm,
              confirmPassword: e.target.value
            })}
            required
          />
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
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
    >
      <FormGroup>
        <Label>Giao diện</Label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button
            onClick={() => onThemeChange('light')}
            style={{ background: theme === 'light' ? '#3182ce' : '#a0aec0' }}
          >
            Sáng
          </Button>
          <Button
            onClick={() => onThemeChange('dark')}
            style={{ background: theme === 'dark' ? '#3182ce' : '#a0aec0' }}
          >
            Tối
          </Button>
        </div>
      </FormGroup>
    </Section>
  );

  const renderSystemSection = () => (
    <Section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {loading ? (
        <LoadingSpinner />
      ) : systemInfo ? (
        <SystemInfoGrid>
          <InfoCard>
            <InfoLabel>Phiên bản</InfoLabel>
            <InfoValue>{systemInfo.version}</InfoValue>
          </InfoCard>
          <InfoCard>
            <InfoLabel>Số người dùng</InfoLabel>
            <InfoValue>{systemInfo.totalUsers}</InfoValue>
          </InfoCard>
          <InfoCard>
            <InfoLabel>Số môn học</InfoLabel>
            <InfoValue>{systemInfo.totalSubjects}</InfoValue>
          </InfoCard>
          <InfoCard>
            <InfoLabel>Số đề thi</InfoLabel>
            <InfoValue>{systemInfo.totalExams}</InfoValue>
          </InfoCard>
        </SystemInfoGrid>
      ) : (
        <ErrorMessage>{error}</ErrorMessage>
      )}
    </Section>
  );

  return (
    <SettingsContainer>
      <Title theme={theme}>Cài đặt</Title>
      
      <TabContainer theme={theme}>
        <TabButton
          active={activeTab === 'password'}
          onClick={() => setActiveTab('password')}
          theme={theme}
        >
          <FaLock /> Đổi mật khẩu
        </TabButton>
        <TabButton
          active={activeTab === 'theme'}
          onClick={() => setActiveTab('theme')}
          theme={theme}
        >
          <FaPalette /> Giao diện
        </TabButton>
        <TabButton
          active={activeTab === 'system'}
          onClick={() => setActiveTab('system')}
          theme={theme}
        >
          <FaInfoCircle /> Thông tin hệ thống
        </TabButton>
      </TabContainer>

      {activeTab === 'password' && renderPasswordSection()}
      {activeTab === 'theme' && renderThemeSection()}
      {activeTab === 'system' && renderSystemSection()}
    </SettingsContainer>
  );
};

export default SettingsPage;