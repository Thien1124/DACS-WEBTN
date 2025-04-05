import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaToggleOn } from 'react-icons/fa';

const NavigationContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  border: 2px solid ${props => props.theme === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(45deg, #4285f4, #34a853);
    color: white;
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    margin-right: 8px;
    font-size: 1.2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.8rem;
  }
`;

const SubjectNavigation = ({ theme }) => {
    const navigate = useNavigate();
  
    return (
      <NavigationContainer>
        <NavButton
          theme={theme}
          onClick={() => navigate('/subject/create')}
        >
          <FaPlus /> Tạo Môn Học Mới
        </NavButton>
  
        <NavButton
          theme={theme}
          onClick={() => navigate('/subject/edit')}
        >
          <FaEdit /> Cập Nhật Môn Học
        </NavButton>
  
        <NavButton
          theme={theme}
          onClick={() => navigate('/subject/delete')}
        >
          <FaTrash /> Xóa Môn Học
        </NavButton>
  
        <NavButton
          theme={theme}
          onClick={() => navigate('/subject/toggle-status')}
        >
          <FaToggleOn /> Trạng Thái Môn Học
        </NavButton>
      </NavigationContainer>
    );
};

export default SubjectNavigation;