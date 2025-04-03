import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import ProfileUpdateModal from './modals/ProfileUpdateModal'; // Updated path to the ProfileUpdateModal component
import { updateUserProfile } from '../services/authService'; // Import named export for API calls

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
  background: linear-gradient(45deg, #00bcd4, #2196f3);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 188, 212, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 188, 212, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  span {
    background: linear-gradient(45deg, #e0f7fa, #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
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

const defaultAvatar = 'https://secure.gravatar.com/avatar?d=mp'; // Avatar mặc định

function Profile({ animation = 'idle' }) {
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.ui);
  const user = useSelector(state => state.auth.user);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
  const [userData, setUserData] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || user?.phone || '',
    address: user?.address || '',
    birthdate: user?.birthdate || '',
    avatar: user?.avatar || defaultAvatar,
  });

  // Cập nhật userData khi user thay đổi
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || user.phone || '',
        address: user.address || '',
        birthdate: user.birthdate || '',
        avatar: user.avatar || defaultAvatar,
      });
    }
  }, [user]);
  
  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };
  
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };
  
  const handleUpdateUserData = async (updatedData) => {
    try {
      console.log('Updating user data:', updatedData);
      const response = await updateUserProfile(updatedData);
      
      // Update local state with the response data
      setUserData(prev => ({
        ...prev,
        name: response.fullName || updatedData.fullName,
        email: response.email || updatedData.email,
        phone: response.phoneNumber || updatedData.phoneNumber
      }));
      
      // Update Redux store with the complete user data
      dispatch({
        type: 'auth/updateUser',
        payload: {
          ...user,
          fullName: response.fullName || updatedData.fullName,
          email: response.email || updatedData.email,
          phoneNumber: response.phoneNumber || updatedData.phoneNumber
        }
      });

      handleCloseUpdateModal();
      // Show success notification
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(error.message || 'Không thể cập nhật thông tin cá nhân.');
      throw error;
    }
  };

  return (
    <ProfileContainer theme={theme}>
      <ProfileContent>
        <ProfileImage
          src={userData.avatar || defaultAvatar}
          alt="Profile"
          animate={animationVariants[animation]}
          theme={theme}
          onError={(e) => {
            e.target.src = defaultAvatar; // Fallback nếu ảnh lỗi
          }}
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
            <h4>Số điện thoại</h4>
            <p>{userData.phone || userData.phoneNumber || 'Chưa cập nhật'}</p>
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
        show={isUpdateModalOpen}
        handleClose={handleCloseUpdateModal}
        userData={userData}
        theme={theme}
        updateProfile={handleUpdateUserData}
      />
    </ProfileContainer>
  );
}

export default Profile;