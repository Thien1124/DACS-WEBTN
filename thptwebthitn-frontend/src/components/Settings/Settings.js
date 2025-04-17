import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaLock, FaBell, FaShieldAlt, FaPalette, FaSignOutAlt } from 'react-icons/fa';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import * as authService from '../../services/authService';
import { logout, updateUserProfile } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { respondTo, respondBelow } from '../../assets/styles/responsive';
import { toast } from 'react-toastify';
const SettingsLayout = styled.div`
  display: flex;
  gap: 30px;
  
  ${respondBelow.md`
    flex-direction: column;
  `}
`;
// Styled Components
const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  `;
  
  const PageContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px;
    flex: 1;
  `;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 15px;
`;



const Sidebar = styled.div`
  width: 280px;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  
  @media (max-width: 992px) {
    width: 100%;
  }
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 5px;
`;

const NavLink = styled.button`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  font-size: 1rem;
  color: #555;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  
  ${props => props.active && `
    background-color: #e9ecef;
    color: #4285f4;
    border-left-color: #4285f4;
  `}
  
  &:hover {
    background-color: #e9ecef;
  }
  
  svg {
    margin-right: 12px;
    font-size: 1.2rem;
  }
`;

const NavDivider = styled.div`
  height: 1px;
  background-color: #e2e8f0;
  margin: 15px 0;
`;

const ContentArea = styled.div`
  flex: 1;
  background-color: #fff;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  min-height: 500px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #444;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
`;

const Form = styled.form`
  max-width: 600px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #666;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: linear-gradient(45deg, #3367d6, #2a8a44);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled(Button)`
  background: #f1f3f5;
  color: #555;
  margin-left: 10px;
  
  &:hover {
    background: #e9ecef;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 5px;
`;

const SuccessMessage = styled.div`
  color: #2ecc71;
  background-color: rgba(46, 204, 113, 0.1);
  border-left: 3px solid #2ecc71;
  font-size: 0.95rem;
  margin-bottom: 20px;
  padding: 10px 15px;
  border-radius: 5px;
`;

const LogoutSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #fff8f8;
  border: 1px solid #ffcccc;
  border-radius: 5px;
`;

const LogoutButton = styled(Button)`
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  
  &:hover {
    background: linear-gradient(45deg, #c0392b, #a33025);
  }
`;

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [activeSection, setActiveSection] = useState('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Load user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileForm.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên đầy đủ';
    }
    
    if (!profileForm.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (profileForm.phoneNumber && !/^[0-9]{10,11}$/.test(profileForm.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit profile form
  // Submit profile form
// Submit profile form
const handleProfileSubmit = async (e) => {
  e.preventDefault();
  
  if (validateProfileForm()) {
    setIsProfileLoading(true);
    try {
      // Tạo đối tượng dữ liệu để cập nhật
      const updateData = {
        fullName: profileForm.fullName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber
      };
      
      console.log('Submitting update data:', updateData);
      
      // Dispatch action cập nhật profile
      const resultAction = await dispatch(updateUserProfile(updateData));
      
      // Kiểm tra kết quả
      if (updateUserProfile.fulfilled.match(resultAction)) {
        console.log('Profile updated successfully:', resultAction.payload);
        
        // Cập nhật lại form với dữ liệu mới (đảm bảo hiển thị dữ liệu đã được cập nhật)
        setProfileForm({
          fullName: resultAction.payload.fullName || updateData.fullName,
          email: resultAction.payload.email || updateData.email,
          phoneNumber: resultAction.payload.phoneNumber || updateData.phoneNumber
        });
        
        // Hiển thị thông báo thành công
        toast.success('Thông tin cá nhân đã được cập nhật thành công!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } else {
        console.error('Profile update failed:', resultAction);
        
        // Hiển thị thông báo lỗi bằng react-toastify
        toast.error(resultAction.payload || 'Cập nhật thông tin thất bại. Vui lòng thử lại.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        setProfileErrors({
          general: resultAction.payload || 'Cập nhật thông tin thất bại. Vui lòng thử lại.'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      // Hiển thị thông báo lỗi
      setProfileErrors({
        general: error.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại.'
      });
    } finally {
      setIsProfileLoading(false);
    }
  }
};
  
  // Submit password form
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      setIsPasswordLoading(true);
      try {
        // Call API to change password
        await authService.changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        });
        
        toast.success('Mật khẩu đã được thay đổi thành công!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          setPasswordSuccess('');
        }, 3000);
      } catch (error) {
        toast.error(error.message || 'Thay đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        setPasswordErrors({
          general: error.message || 'Thay đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.'
        });
      } finally {
        setIsPasswordLoading(false);
      }
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    toast.info('Đã đăng xuất thành công', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
    navigate('/');
  };
  
  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <>
            <SectionTitle>Thông tin cá nhân</SectionTitle>
            {profileSuccess && <SuccessMessage>{profileSuccess}</SuccessMessage>}
            {profileErrors.general && <ErrorMessage>{profileErrors.general}</ErrorMessage>}
            
            <Form onSubmit={handleProfileSubmit}>
              <FormGroup>
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profileForm.fullName}
                  onChange={handleProfileChange}
                />
                {profileErrors.fullName && <ErrorMessage>{profileErrors.fullName}</ErrorMessage>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                />
                {profileErrors.email && <ErrorMessage>{profileErrors.email}</ErrorMessage>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={handleProfileChange}
                />
                {profileErrors.phoneNumber && <ErrorMessage>{profileErrors.phoneNumber}</ErrorMessage>}
              </FormGroup>
              
              <div>
                <Button type="submit" disabled={isProfileLoading}>
                  {isProfileLoading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </Button>
                <CancelButton type="button" onClick={() => {
                  if (user) {
                    setProfileForm({
                      fullName: user.fullName || '',
                      email: user.email || '',
                      phoneNumber: user.phoneNumber || ''
                    });
                  }
                  setProfileErrors({});
                }}>
                  Hủy
                </CancelButton>
              </div>
            </Form>
          </>
        );
        
      case 'password':
        return (
          <>
            <SectionTitle>Thay đổi mật khẩu</SectionTitle>
            {passwordSuccess && <SuccessMessage>{passwordSuccess}</SuccessMessage>}
            {passwordErrors.general && <ErrorMessage>{passwordErrors.general}</ErrorMessage>}
            
            <Form onSubmit={handlePasswordSubmit}>
              <FormGroup>
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <PasswordInputWrapper>
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </PasswordToggle>
                </PasswordInputWrapper>
                {passwordErrors.currentPassword && <ErrorMessage>{passwordErrors.currentPassword}</ErrorMessage>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <PasswordInputWrapper>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </PasswordToggle>
                </PasswordInputWrapper>
                {passwordErrors.newPassword && <ErrorMessage>{passwordErrors.newPassword}</ErrorMessage>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <PasswordInputWrapper>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </PasswordToggle>
                </PasswordInputWrapper>
                {passwordErrors.confirmPassword && <ErrorMessage>{passwordErrors.confirmPassword}</ErrorMessage>}
              </FormGroup>
              
              <div>
                <Button type="submit" disabled={isPasswordLoading}>
                  {isPasswordLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                </Button>
                <CancelButton type="button" onClick={() => {
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setPasswordErrors({});
                }}>
                  Hủy
                </CancelButton>
              </div>
            </Form>
          </>
        );
        
      case 'logout':
        return (
          <>
            <SectionTitle>Đăng xuất</SectionTitle>
            <LogoutSection>
              <p>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</p>
              <LogoutButton onClick={handleLogout}>
                Đăng xuất
              </LogoutButton>
            </LogoutSection>
          </>
        );
        
      default:
        return (
          <div>
            <SectionTitle>Coming Soon</SectionTitle>
            <p>Tính năng này đang được phát triển.</p>
          </div>
        );
    }
  };
  
  return (
    <PageWrapper>
      <Header />
        <PageContainer>
          <PageTitle>Cài đặt tài khoản</PageTitle>
          
          <SettingsLayout>
            <Sidebar>
              <NavMenu>
                <NavItem>
                  <NavLink 
                    active={activeSection === 'profile'} 
                    onClick={() => setActiveSection('profile')}
                  >
                    <FaUser /> Thông tin cá nhân
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    active={activeSection === 'password'} 
                    onClick={() => setActiveSection('password')}
                  >
                    <FaLock /> Đổi mật khẩu
                  </NavLink>
                </NavItem>
                <NavDivider />
                <NavItem>
                  <NavLink 
                    active={activeSection === 'notifications'} 
                    onClick={() => setActiveSection('notifications')}
                  >
                    <FaBell /> Thông báo
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    active={activeSection === 'security'} 
                    onClick={() => setActiveSection('security')}
                  >
                    <FaShieldAlt /> Bảo mật
                  </NavLink>
                </NavItem>
                <NavDivider />
                <NavItem>
                  <NavLink 
                    active={activeSection === 'appearance'} 
                    onClick={() => setActiveSection('appearance')}
                  >
                    <FaPalette /> Giao diện
                  </NavLink>
                </NavItem>
                <NavDivider />
                <NavItem>
                  <NavLink 
                    active={activeSection === 'logout'} 
                    onClick={() => setActiveSection('logout')}
                  >
                    <FaSignOutAlt /> Đăng xuất
                  </NavLink>
                </NavItem>
              </NavMenu>
            </Sidebar>
            
            <ContentArea>
              {renderContent()}
            </ContentArea>
          </SettingsLayout>
        </PageContainer>
    </PageWrapper>
  );
};

export default Settings;