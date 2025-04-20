import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell, FaCog, FaCheck, FaSave, FaUndo } from 'react-icons/fa';
import useExamReminders from '../hooks/useExamReminders';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${(props) => (props.theme === "dark" ? "#1a1a1a" : "#f5f8fa")};
`;

const ContentContainer = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;

const SettingsCard = styled.div`
  background-color: ${(props) => (props.theme === "dark" ? "#2d2d2d" : "white")};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
`;

const SettingsTitle = styled.h2`
  margin: 0;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
  font-size: 1.5rem;
  font-weight: 600;
  margin-left: 1rem;
`;

const SettingsIconWrapper = styled.div`
  font-size: 1.8rem;
  color: ${(props) => (props.theme === "dark" ? "#90cdf4" : "#3182ce")};
`;

const SettingItem = styled.div`
  margin-bottom: 1.5rem;
`;

const SettingLabel = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;

const SettingDescription = styled.p`
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const RangeInput = styled.div`
  display: flex;
  align-items: center;
  
  input[type="range"] {
    flex: 1;
    height: 10px;
    border-radius: 5px;
    background: ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
    outline: none;
    -webkit-appearance: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${(props) => (props.theme === "dark" ? "#90cdf4" : "#3182ce")};
      cursor: pointer;
    }
  }
  
  span {
    margin-left: 15px;
    min-width: 60px;
    color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
    font-weight: 500;
  }
`;

const ToggleSwitch = styled.div`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  margin-right: 15px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${(props) => (props.theme === "dark" ? "#4a5568" : "#cbd5e0")};
    transition: .4s;
    border-radius: 30px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: ${(props) => (props.theme === "dark" ? "#90cdf4" : "#3182ce")};
  }
  
  input:checked + .slider:before {
    transform: translateX(30px);
  }
`;

const ToggleOption = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const ToggleLabel = styled.span`
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &.primary {
    background-color: ${(props) => (props.theme === "dark" ? "#4285f4" : "#4285f4")};
    color: white;
    
    &:hover {
      background-color: ${(props) => (props.theme === "dark" ? "#3367d6" : "#3367d6")};
    }
  }
  
  &.secondary {
    background-color: ${(props) => (props.theme === "dark" ? "#718096" : "#e2e8f0")};
    color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
    
    &:hover {
      background-color: ${(props) => (props.theme === "dark" ? "#4a5568" : "#cbd5e0")};
    }
  }
`;

const SavedMessage = styled.div`
  background-color: ${(props) => (props.theme === "dark" ? "#2f855a" : "#c6f6d5")};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#22543d")};
  padding: 10px 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  svg {
    margin-right: 10px;
  }
`;

const NotificationSettingsPage = () => {
  const { resetDismissedExams } = useExamReminders();
  const [settings, setSettings] = useState({
    enabled: true,
    daysThreshold: 7,
    emailNotifications: true,
    pushNotifications: false,
    showOnDashboard: true,
    soundEnabled: true
  });
  const [savedMessage, setSavedMessage] = useState(false);
  const themeFromStore = useSelector((state) => state.ui?.theme);
  const [theme, setTheme] = useState(themeFromStore || "light");
  
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Load theme
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);
  
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'range' ? parseInt(value) : value
    }));
  };
  
  const saveSettings = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };
  
  const resetSettings = () => {
    const defaultSettings = {
      enabled: true,
      daysThreshold: 7,
      emailNotifications: true,
      pushNotifications: false,
      showOnDashboard: true,
      soundEnabled: true
    };
    setSettings(defaultSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(defaultSettings));
    resetDismissedExams(); // Reset dismissed exams
  };
  
  return (
    <PageContainer theme={theme}>
      <Header />
      
      <ContentContainer>
        <PageTitle theme={theme}>Cài đặt thông báo</PageTitle>
        
        {savedMessage && (
          <SavedMessage theme={theme}>
            <FaCheck /> Cài đặt đã được lưu thành công
          </SavedMessage>
        )}
        
        <SettingsCard theme={theme}>
          <SettingsHeader theme={theme}>
            <SettingsIconWrapper theme={theme}>
              <FaBell />
            </SettingsIconWrapper>
            <SettingsTitle theme={theme}>Thông báo nhắc nhở kỳ thi</SettingsTitle>
          </SettingsHeader>
          
          <SettingItem>
            <ToggleOption>
              <ToggleSwitch theme={theme}>
                <input 
                  type="checkbox" 
                  name="enabled" 
                  checked={settings.enabled}
                  onChange={handleSettingChange}
                />
                <span className="slider"></span>
              </ToggleSwitch>
              <ToggleLabel theme={theme}>Bật thông báo nhắc nhở kỳ thi</ToggleLabel>
            </ToggleOption>
            <SettingDescription theme={theme}>
              Hiển thị thông báo nhắc nhở khi có kỳ thi sắp diễn ra
            </SettingDescription>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel theme={theme}>Nhắc nhở trước khi thi</SettingLabel>
            <SettingDescription theme={theme}>
              Chọn số ngày trước khi thi mà bạn muốn nhận thông báo nhắc nhở
            </SettingDescription>
            <RangeInput theme={theme}>
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={settings.daysThreshold} 
                name="daysThreshold"
                onChange={handleSettingChange}
                disabled={!settings.enabled}
              />
              <span>{settings.daysThreshold} ngày</span>
            </RangeInput>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel theme={theme}>Loại thông báo</SettingLabel>
            <ToggleOption>
              <ToggleSwitch theme={theme}>
                <input 
                  type="checkbox" 
                  name="showOnDashboard" 
                  checked={settings.showOnDashboard}
                  onChange={handleSettingChange}
                  disabled={!settings.enabled}
                />
                <span className="slider"></span>
              </ToggleSwitch>
              <ToggleLabel theme={theme}>Hiển thị trên trang chính</ToggleLabel>
            </ToggleOption>
            
            <ToggleOption>
              <ToggleSwitch theme={theme}>
                <input 
                  type="checkbox" 
                  name="emailNotifications" 
                  checked={settings.emailNotifications}
                  onChange={handleSettingChange}
                  disabled={!settings.enabled}
                />
                <span className="slider"></span>
              </ToggleSwitch>
              <ToggleLabel theme={theme}>Thông báo qua email</ToggleLabel>
            </ToggleOption>
            
            <ToggleOption>
              <ToggleSwitch theme={theme}>
                <input 
                  type="checkbox" 
                  name="pushNotifications" 
                  checked={settings.pushNotifications}
                  onChange={handleSettingChange}
                  disabled={!settings.enabled}
                />
                <span className="slider"></span>
              </ToggleSwitch>
              <ToggleLabel theme={theme}>Thông báo đẩy</ToggleLabel>
            </ToggleOption>
            
            <ToggleOption>
              <ToggleSwitch theme={theme}>
                <input 
                  type="checkbox" 
                  name="soundEnabled" 
                  checked={settings.soundEnabled}
                  onChange={handleSettingChange}
                  disabled={!settings.enabled}
                />
                <span className="slider"></span>
              </ToggleSwitch>
              <ToggleLabel theme={theme}>Âm thanh thông báo</ToggleLabel>
            </ToggleOption>
          </SettingItem>
          
          <ButtonGroup>
            <Button onClick={resetSettings} className="secondary" theme={theme}>
              <FaUndo /> Khôi phục mặc định
            </Button>
            <Button onClick={saveSettings} className="primary" theme={theme}>
              <FaSave /> Lưu cài đặt
            </Button>
          </ButtonGroup>
        </SettingsCard>
      </ContentContainer>
      
      <Footer />
    </PageContainer>
  );
};

export default NotificationSettingsPage;