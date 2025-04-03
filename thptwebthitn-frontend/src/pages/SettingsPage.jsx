import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SettingsContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 2rem;
`;

const Section = styled.section`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  }

  input, select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    border-radius: 4px;
    background: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

const SaveButton = styled(motion.button)`
  background: #4299e1;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #3182ce;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #4299e1;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const SettingsPage = () => {
  const { theme } = useSelector(state => state.ui);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: theme === 'dark',
    language: 'vi'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <SettingsContainer>
      <Title theme={theme}>Cài đặt</Title>

      <Section theme={theme}>
        <SectionTitle theme={theme}>Thông báo</SectionTitle>
        <FormGroup theme={theme}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Thông báo email</label>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              <span></span>
            </ToggleSwitch>
          </div>
        </FormGroup>

        <FormGroup theme={theme}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Thông báo đẩy</label>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="pushNotifications"
                checked={settings.pushNotifications}
                onChange={handleChange}
              />
              <span></span>
            </ToggleSwitch>
          </div>
        </FormGroup>
      </Section>

      <Section theme={theme}>
        <SectionTitle theme={theme}>Giao diện</SectionTitle>
        <FormGroup theme={theme}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Chế độ tối</label>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleChange}
              />
              <span></span>
            </ToggleSwitch>
          </div>
        </FormGroup>

        <FormGroup theme={theme}>
          <label>Ngôn ngữ</label>
          <select
            name="language"
            value={settings.language}
            onChange={handleChange}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </FormGroup>
      </Section>

      <SaveButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Lưu thay đổi
      </SaveButton>
    </SettingsContainer>
  );
};

export default SettingsPage;
