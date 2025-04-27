import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchSubjectById } from '../../redux/subjectSlice';
import { 
  FaArrowLeft, 
  FaRegFileAlt, 
  FaUserAlt, 
  FaChalkboardTeacher, 
  FaGraduationCap, 
  FaBookOpen,
  FaInfoCircle,
  FaHistory,
  FaLayerGroup,
  FaBook
} from 'react-icons/fa';

// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  a {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    margin: 0 0.75rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

const NavigationRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f5f7fa'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const HistoryButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f5f7fa'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const SubjectHeader = styled(motion.div)`
  display: flex;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SubjectImage = styled.div`
  width: 320px;
  height: 220px;
  background-image: ${props => `url(${props.image || 'https://via.placeholder.com/320x220?text=Môn+học'})`};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 1.5rem;
  }
`;

const GradeBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #4285f4;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 10px rgba(66, 133, 244, 0.4);
`;

const SubjectInfo = styled.div`
  flex: 1;
  padding-left: 2.5rem;
  
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const SubjectTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 700;
  
  span {
    background: linear-gradient(45deg, #4285f4, #34a853);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const SubjectCode = styled.div`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const SubjectDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const SubjectStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatIcon = styled.span`
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => props.theme === 'dark' ? '#1a202c' : '#ebf8ff'};
  border-radius: 50%;
`;

const StatText = styled.span`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  font-size: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 2.5rem 0 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.75rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(45deg, #4285f4, #34a853);
    border-radius: 3px;
  }

  svg {
    color: #4285f4;
  }
`;

const DetailSection = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#3a3a3a' : '#edf2f7'};
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const DetailLabel = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1rem;
  font-weight: 500;
  width: 180px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 0.5rem;
  }
`;

const DetailValue = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  flex: 1;
`;

const GradeTag = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #4285f4;
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ContentBox = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 15px;
  padding: 2rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  line-height: 1.8;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  h3 {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  ul, ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const NoContentMessage = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-style: italic;
  text-align: center;
  padding: 2rem;
`;

const ChaptersSection = styled.div`
  margin-top: 2rem;
  margin-bottom: 3rem;
`;

const ChaptersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ChapterCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#fff'};
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.theme === 'dark' ? '#4299e1' : '#3182ce'};
`;

const ChapterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const ChapterTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChapterDescription = styled.p`
  margin: 0.75rem 0;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const ChapterOrder = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border-radius: 9999px;
  height: 1.5rem;
  min-width: 1.5rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  border: 1px dashed ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const ButtonsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  
  p {
    margin-top: 1rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
    font-size: 1.1rem;
  }
`;

const SubjectDetail = () => {
  const { subjectId } = useParams(); // Make sure parameter name matches route definition
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.ui);
  const { selectedSubject, loading, error } = useSelector(state => state.subjects);
  const user = useSelector(state => state.auth.user);
  
  // Debug logging
  console.log("Subject ID from params:", subjectId);
  
  useEffect(() => {
    console.log("Fetching subject with ID:", subjectId);
    dispatch(fetchSubjectById(subjectId));
  }, [dispatch, subjectId]);
  
  console.log("Redux state - subject:", selectedSubject);
  console.log("Redux state - loading:", loading);
  console.log("Redux state - error:", error);
  
  // Helper function for subject image
  const getSubjectImage = () => {
    if (!selectedSubject) return 'https://via.placeholder.com/320x220?text=Môn+học';
    
    const defaultImages = {
      'Toán': '/images/math.png',
      'Vật Lý': '/images/physics.png',
      'Hóa Học': '/images/chemistry.png',
      'Sinh Học': '/images/biology.png',
      'Ngữ Văn': '/images/literature.png',
      'Tiếng Anh': '/images/english.png',
      'Lịch Sử': '/images/history.png',
      'Địa Lý': '/images/geography.png',
    };
    
    return selectedSubject.imageUrl || defaultImages[selectedSubject.name] || 'https://via.placeholder.com/320x220?text=Môn+học';
  };
  
  // Simple content description
  const getSubjectContentDescription = () => {
    if (!selectedSubject) return null;
    return `Chương trình ${selectedSubject.name} theo chuẩn của Bộ Giáo dục và Đào tạo, giúp học sinh xây dựng nền tảng kiến thức vững chắc cho kỳ thi THPT Quốc gia.`;
  };
  
  const currentTime = new Date().toLocaleString('vi-VN');
  const currentUser = user?.username || "Khách";
  
  if (loading) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <Container>
          <LoadingContainer theme={theme}>
            <LoadingSpinner size={50} />
            <p>Đang tải thông tin môn học...</p>
          </LoadingContainer>
        </Container>
        <Footer />
      </PageWrapper>
    );
  }
  
  if (error) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <Container>
          <ErrorDisplay message={error} />
          <BackButton to="/subjects" theme={theme}>
            <FaArrowLeft /> Quay lại danh sách môn học
          </BackButton>
        </Container>
        <Footer />
      </PageWrapper>
    );
  }
  
  const subjectContent = selectedSubject?.content || getSubjectContentDescription();
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <BreadcrumbNav theme={theme}>
          <Link to="/subjects">Các môn học</Link>
          <span>›</span>
          <span>{selectedSubject?.name || 'Chi tiết môn học'}</span>
        </BreadcrumbNav>
        
        {selectedSubject ? (
          <>
            <NavigationRow>
              <BackButton to="/subjects" theme={theme}>
                <FaArrowLeft /> Quay lại danh sách môn học
              </BackButton>
              {user && 
                <HistoryButton onClick={() => navigate('/exam-history')} theme={theme}>
                  <FaHistory /> Xem lịch sử bài thi
                </HistoryButton>
              }
            </NavigationRow>

            <SubjectHeader
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SubjectImage image={getSubjectImage()}>
                {selectedSubject.grade && (
                  <GradeBadge>Lớp {selectedSubject.grade}</GradeBadge>
                )}
              </SubjectImage>
              
              <SubjectInfo>
                <SubjectTitle theme={theme}>
                  <span>{selectedSubject.name}</span>
                </SubjectTitle>
                
                {selectedSubject.code && (
                  <SubjectCode theme={theme}>
                    Mã môn: {selectedSubject.code}
                  </SubjectCode>
                )}
                
                <SubjectDescription theme={theme}>
                  {selectedSubject.description || 'Không có mô tả cho môn học này.'}
                </SubjectDescription>
                
                <SubjectStats>
                  <StatItem>
                    <StatIcon theme={theme}>
                      <FaGraduationCap />
                    </StatIcon>
                    <StatText theme={theme}>
                      {selectedSubject.grade ? `Lớp ${selectedSubject.grade}` : 'Tất cả các lớp'}
                    </StatText>
                  </StatItem>
                  
                  <StatItem>
                    <StatIcon theme={theme}>
                      <FaRegFileAlt />
                    </StatIcon>
                    <StatText theme={theme}>{selectedSubject.examsCount || 0} đề thi</StatText>
                  </StatItem>
                </SubjectStats>
              </SubjectInfo>
            </SubjectHeader>
            
            <SectionTitle theme={theme}>
              <FaInfoCircle />
              Thông tin môn học
            </SectionTitle>
            
            <DetailSection theme={theme}>
              <DetailItem theme={theme}>
                <DetailLabel theme={theme}>Khối lớp</DetailLabel>
                <DetailValue theme={theme}>
                  {selectedSubject.grade ? (
                    <GradeTag>Lớp {selectedSubject.grade}</GradeTag>
                  ) : (
                    'Tất cả các lớp'
                  )}
                </DetailValue>
              </DetailItem>
              
              <DetailItem theme={theme}>
                <DetailLabel theme={theme}>Mã môn học</DetailLabel>
                <DetailValue theme={theme}>{selectedSubject.code || 'Không có mã'}</DetailValue>
              </DetailItem>
              
              <DetailItem theme={theme}>
                <DetailLabel theme={theme}>Trạng thái</DetailLabel>
                <DetailValue theme={theme}>
                  <span style={{ 
                    color: selectedSubject.isActive ? '#34a853' : '#ea4335',
                    fontWeight: 500
                  }}>
                    {selectedSubject.isActive ? '● Đang hoạt động' : '● Đã khóa'}
                  </span>
                </DetailValue>
              </DetailItem>
              
              <DetailItem theme={theme}>
                <DetailLabel theme={theme}>Ngày cập nhật</DetailLabel>
                <DetailValue theme={theme}>
                  {selectedSubject.updatedAt ? 
                    new Date(selectedSubject.updatedAt).toLocaleDateString('vi-VN') : 
                    'Chưa cập nhật'
                  }
                </DetailValue>
              </DetailItem>
            </DetailSection>
            
            <SectionTitle theme={theme}>
              <FaBookOpen />
              Nội dung chương trình học
            </SectionTitle>
            
            <ContentBox theme={theme}>
              {subjectContent ? (
                <div dangerouslySetInnerHTML={{ __html: subjectContent }} />
              ) : (
                <NoContentMessage theme={theme}>
                  Chưa có thông tin chi tiết về nội dung chương trình học của môn này.
                </NoContentMessage>
              )}
            </ContentBox>

            <SectionTitle theme={theme}>
              <FaLayerGroup /> Chương Học
            </SectionTitle>
            
            <ChaptersList>
              {selectedSubject.chapters && selectedSubject.chapters.length > 0 ? (
                selectedSubject.chapters
                  .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                  .map(chapter => (
                    <ChapterCard key={chapter.id} theme={theme}>
                      <ChapterHeader>
                        <ChapterTitle theme={theme}>
                          <FaBook />
                          {chapter.name}
                          <ChapterOrder theme={theme}>
                            {chapter.orderIndex || '?'}
                          </ChapterOrder>
                        </ChapterTitle>
                      </ChapterHeader>
                      
                      <ChapterDescription theme={theme}>
                        {chapter.description || 'Không có mô tả.'}
                      </ChapterDescription>
                      
                      {chapter.lessonsCount > 0 && (
                        <div style={{ 
                          marginTop: '0.75rem', 
                          fontSize: '0.9rem', 
                          color: theme === 'dark' ? '#a0aec0' : '#718096' 
                        }}>
                          <FaRegFileAlt style={{ marginRight: '0.5rem', display: 'inline' }} />
                          {chapter.lessonsCount} bài học
                        </div>
                      )}
                    </ChapterCard>
                  ))
              ) : (
                <EmptyState theme={theme}>
                  Môn học này chưa có chương nào.
                </EmptyState>
              )}
            </ChaptersList>

            <ButtonsRow>
              <BackButton to="/subjects" theme={theme}>
                <FaArrowLeft /> Quay lại danh sách môn học
              </BackButton>
              
              <div>
                <ActionButton onClick={() => navigate(`/subjects/${subjectId}/exams`)}>
                  <FaRegFileAlt /> Xem danh sách đề thi
                </ActionButton>
                
                {user && (user.role === 'Admin' || user.role === 'Teacher') && (
                  <ActionButton 
                    onClick={() => navigate(`/subject/edit/${subjectId}`)}
                    style={{ marginLeft: '1rem' }}
                  >
                    <FaChalkboardTeacher /> Chỉnh sửa môn học
                  </ActionButton>
                )}
              </div>
            </ButtonsRow>
          </>
        ) : (
          <div>Không tìm thấy thông tin của môn học này.</div>
        )}
        
        <div style={{ 
          marginTop: '3rem',
          fontSize: '0.8rem',
          color: theme === 'dark' ? '#718096' : '#a0aec0',
          textAlign: 'right'
        }}>
          Truy cập vào lúc: {currentTime} | Người dùng: {currentUser}
        </div>
      </Container>
      
      <Footer />
    </PageWrapper>
  );
};

export default SubjectDetail;