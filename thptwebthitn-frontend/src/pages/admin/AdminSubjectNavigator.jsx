import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaToggleOn } from 'react-icons/fa';

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 700;
`;

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const AdminCard = styled(Link)`
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#ebf8ff'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  
  svg {
    font-size: 1.75rem;
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
  }
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.95rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const AdminSubjectNavigator = () => {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    // Lấy theme từ localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);
  
  return (
    <Container
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageTitle theme={theme}>Quản lý Môn học</PageTitle>
      
      <AdminGrid>
        <AdminCard 
          to="/admin/subjects/create" 
          theme={theme}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <IconContainer theme={theme}>
            <FaPlus />
          </IconContainer>
          <CardTitle theme={theme}>Thêm Môn học</CardTitle>
          <CardDescription theme={theme}>
            Tạo môn học mới trong hệ thống
          </CardDescription>
        </AdminCard>
        
        <AdminCard 
          to="/admin/subjects/edit" 
          theme={theme}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <IconContainer theme={theme}>
            <FaEdit />
          </IconContainer>
          <CardTitle theme={theme}>Sửa Môn học</CardTitle>
          <CardDescription theme={theme}>
            Cập nhật thông tin môn học hiện có
          </CardDescription>
        </AdminCard>
        
        <AdminCard 
          to="/admin/subjects/delete" 
          theme={theme}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <IconContainer theme={theme}>
            <FaTrash />
          </IconContainer>
          <CardTitle theme={theme}>Xóa Môn học</CardTitle>
          <CardDescription theme={theme}>
            Xóa môn học khỏi hệ thống
          </CardDescription>
        </AdminCard>
        
        <AdminCard 
          to="/admin/subjects/toggle-status" 
          theme={theme}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <IconContainer theme={theme}>
            <FaToggleOn />
          </IconContainer>
          <CardTitle theme={theme}>Trạng thái Môn học</CardTitle>
          <CardDescription theme={theme}>
            Kích hoạt hoặc vô hiệu hóa môn học
          </CardDescription>
        </AdminCard>
      </AdminGrid>
    </Container>
  );
};

export default AdminSubjectNavigator;