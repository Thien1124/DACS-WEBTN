import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import ProfileUpdateModal from './ProfileUpdateModal';

const ProfileContainer = styled.section`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme === 'dark'
    ? 'linear-gradient(135deg, #1e3c72, #2a5298)'
    : 'linear-gradient(135deg, #e0f7fa, #80deea)'};
  padding: 2rem;
`;

const ProfileContent = styled.div`
  max-width: 800px;
  width: 100%;
  background: ${props => props.theme === 'dark' ? '#2c3e50' : '#ffffff'};
  border-radius: 12px;
  box-shadow: ${props => props.theme === 'dark'
    ? '0 10px 30px rgba(0, 0, 0, 0.5)'
    : '0 10px 30px rgba(0, 0, 0, 0.15)'};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ProfileImage = styled(motion.img)`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  box-shadow: ${props => props.theme === 'dark'
    ? '0 4px 8px rgba(255, 255, 255, 0.1)'
    : '0 4px 8px rgba(0, 0, 0, 0.1)'};
  object-fit: cover;
`;

const ProfileName = styled(motion.h1)`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#00796b'};
`;

const ProfileEmail = styled(motion.p)`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#b0bec5' : '#00796b'};
`;

const ProfileDetails = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-width: 600px;
  width: 100%;
`;

const DetailItem = styled.div`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 188, 212, 0.1)'};
  border-radius: 8px;
  min-width: 150px;
  
  h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.9rem;
    color: ${props => props.theme === 'dark' ? '#b0bec5' : '#00796b'};
    font-weight: 500;
  }
  
  p {
    margin: 0;
    font-weight: 600;
    color: ${props => props.theme === 'dark' ? '#ffffff' : '#00796b'};
  }
`;

const ProfileButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #00bcd4, #009688);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 188, 212, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 150, 136, 0.3);
  }
`;

const animationVariants = {
  fadeIn: {
    opacity: [0, 1],
    transition: { duration: 1 }
  },
  slideUp: {
    opacity: [0, 1],
    y: [50, 0],
    transition: { duration: 1 }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 1, repeat: Infinity, repeatDelay: 0.5 }
  },
  idle: {}
};

function Profile({ animation = 'idle' }) {
  const { theme } = useSelector(state => state.ui);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
  // For demonstration purposes, we'll create a mock user profile
  // In a real app, this would come from your Redux store or context
  const [userData, setUserData] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0123456789',
    grade: '12',
    school: 'THPT ABC',
    address: 'Hà Nội, Việt Nam',
    birthdate: '2007-05-15',
    profileImage: 'https://vgrow.co/wp-content/uploads/2021/12/unnamed-2.png'
  });
  
  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };
  
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };
  
  // Add this function to utilize setUserData
  const handleUpdateUserData = (updatedData) => {
    setUserData(updatedData);
    handleCloseUpdateModal();
  };

  return (
    <ProfileContainer theme={theme}>
      <ProfileContent>
        <ProfileImage
          src={userData.profileImage}
          alt="Profile Image"
          animate={animationVariants[animation]}
          theme={theme}
        />
        <ProfileName
          theme={theme}
          animate={animationVariants[animation]}
        >
          {userData.name}
        </ProfileName>
        <ProfileEmail
          theme={theme}
          animate={animationVariants[animation]}
        >
          {userData.email}
        </ProfileEmail>
        
        <ProfileDetails 
          animate={animationVariants[animation]}
        >
          <DetailItem theme={theme}>
            <h4>Lớp</h4>
            <p>{userData.grade ? `Lớp ${userData.grade}` : 'Chưa cập nhật'}</p>
          </DetailItem>
          <DetailItem theme={theme}>
            <h4>Trường</h4>
            <p>{userData.school || 'Chưa cập nhật'}</p>
          </DetailItem>
          <DetailItem theme={theme}>
            <h4>Số điện thoại</h4>
            <p>{userData.phone || 'Chưa cập nhật'}</p>
          </DetailItem>
          <DetailItem theme={theme}>
            <h4>Ngày sinh</h4>
            <p>
              {userData.birthdate ? new Date(userData.birthdate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
            </p>
          </DetailItem>
        </ProfileDetails>
        
        <ProfileButton
          animate={animationVariants[animation]}
          onClick={handleOpenUpdateModal}
        >
          Cập nhật thông tin
        </ProfileButton>
      </ProfileContent>
      
      {/* Profile Update Modal */}
      <ProfileUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        userData={userData}
        theme={theme}
        onSubmit={handleUpdateUserData} // Pass the update function to the modal
      />
    </ProfileContainer>
  );
}

export default Profile;