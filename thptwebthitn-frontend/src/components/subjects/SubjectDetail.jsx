import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  a {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    margin: 0 0.5rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  }
`;

const SubjectHeader = styled(motion.div)`
  display: flex;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SubjectImage = styled.div`
  width: 300px;
  height: 200px;
  background-image: ${props => `url(${props.image})`};
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5));
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 1.5rem;
  }
`;

const SubjectGradeBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 123, 255, 0.9);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const SubjectInfo = styled.div`
  flex: 1;
  padding-left: 2rem;
  
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const SubjectTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const SubjectDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
`;

const SubjectStats = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatIcon = styled.span`
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
`;

const StatText = styled.span`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-weight: 500;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ExamCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
`;

const ExamContent = styled.div`
  padding: s1.25rem;
`;

const ExamTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const ExamInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ExamDescription = styled.p`
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
`;

const ExamMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};
  padding-top: 1rem;
  margin-top: 0.5rem;
`;

const ExamDifficulty = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DifficultyDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => {
    if (props.level === 'easy') return '#28a745';
    if (props.level === 'medium') return '#ffc107';
    return '#dc3545';
  }};
`;

const DifficultyText = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
`;

const StartButton = styled(Link)`
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(45deg, #0069d9, #00c2e6);
    transform: translateY(-2px);
  }
`;

const NoExamsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : '#f8f9fa'};
  border-radius: 10px;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-size: 1.1rem;
  margin-top: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const SubjectDetail = ({ theme }) => {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSubjectData = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would make API calls to fetch subject and exams
        // For demo purposes, we'll use mock data with a delay to simulate API calls
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Find subject by ID from mock data
        const mockSubjects = [
          {
            id: "1",
            title: 'Toán học',
            description: 'Toán học là môn học cơ bản về các khái niệm số học, đại số, hình học và các ứng dụng của chúng. Môn học giúp học sinh phát triển tư duy logic, khả năng phân tích và giải quyết vấn đề. Thông qua các bài tập từ cơ bản đến nâng cao, học sinh sẽ được rèn luyện kỹ năng tính toán, suy luận và áp dụng kiến thức vào thực tế.',
            image: 'https://img.freepik.com/free-vector/hand-drawn-mathematics-background_23-2148157511.jpg',
            grade: '10',
            testsCount: 24,
            popularity: 'Cao',
            lastUpdated: '15/05/2023'
          },
          {
            id: "9",
            title: 'Toán học nâng cao',
            description: 'Toán học nâng cao dành cho học sinh khối 11 tập trung vào các chủ đề chuyên sâu như giải tích, đại số tuyến tính, lý thuyết xác suất và thống kê. Khóa học cung cấp kiến thức vững chắc và các kỹ thuật giải quyết bài toán phức tạp, chuẩn bị cho học sinh tham gia các kỳ thi học sinh giỏi cấp trường, cấp tỉnh và quốc gia.',
            image: 'https://img.freepik.com/free-vector/realistic-math-chalkboard-background_23-2148163817.jpg',
            grade: '11',
            testsCount: 22,
            popularity: 'Cao',
            lastUpdated: '10/05/2023'
          },
          {
            id: "13",
            title: 'Toán học – Ôn thi THPT Quốc gia',
            description: 'Khóa học tập trung vào ôn tập toàn diện các kiến thức toán học THPT từ lớp 10 đến lớp 12, đặc biệt chú trọng vào các dạng bài tập thường xuất hiện trong đề thi tốt nghiệp THPT Quốc gia. Khóa học giúp học sinh hệ thống hóa kiến thức, rèn luyện kỹ năng làm bài thi trắc nghiệm và tự luận một cách hiệu quả.',
            image: 'https://img.freepik.com/free-vector/mathematics-collage-concept_23-2148161193.jpg',
            grade: '12',
            testsCount: 30,
            popularity: 'Rất cao',
            lastUpdated: '20/05/2023'
          }
        ];
        
        const foundSubject = mockSubjects.find(s => s.id === subjectId);
        
        if (foundSubject) {
          setSubject(foundSubject);
          
          // Mock exams for the subject
          const mockExams = [
            {
              id: `${subjectId}-1`,
              title: 'Đề kiểm tra 15 phút số 1',
              questions: 10,
              time: 15,
              description: 'Bài kiểm tra nhanh về kiến thức cơ bản, giúp học sinh ôn tập và củng cố các khái niệm đã học.',
              difficulty: 'easy',
              completedCount: 1245
            },
            {
              id: `${subjectId}-2`,
              title: 'Đề kiểm tra 1 tiết số 1',
              questions: 20,
              time: 45,
              description: 'Bài kiểm tra kiến thức chương 1, bao gồm cả lý thuyết và bài tập để đánh giá mức độ hiểu bài của học sinh.',
              difficulty: 'medium',
              completedCount: 987
            },
            {
              id: `${subjectId}-3`,
              title: 'Đề thi học kỳ I',
              questions: 40,
              time: 90,
              description: 'Đề thi cuối học kỳ I bao gồm tất cả kiến thức đã học trong nửa đầu năm học. Đây là bài thi quan trọng đánh giá năng lực học tập của học sinh.',
              difficulty: 'hard',
              completedCount: 752
            },
            {
              id: `${subjectId}-4`,
              title: 'Đề kiểm tra 15 phút số 2',
              questions: 10,
              time: 15,
              description: 'Bài kiểm tra nhanh về các công thức và định lý quan trọng trong chương 2.',
              difficulty: 'easy',
              completedCount: 1032
            },
            {
              id: `${subjectId}-5`,
              title: 'Đề kiểm tra 1 tiết số 2',
              questions: 20,
              time: 45,
              description: 'Bài kiểm tra kiến thức chương 2 và 3, đánh giá khả năng ứng dụng kiến thức vào giải quyết các bài toán thực tế.',
              difficulty: 'medium',
              completedCount: 845
            },
            {
              id: `${subjectId}-6`,
              title: 'Đề thi học kỳ II',
              questions: 40,
              time: 90,
              description: 'Đề thi cuối năm bao gồm tất cả kiến thức đã học, đặc biệt chú trọng vào các nội dung đã học trong học kỳ II.',
              difficulty: 'hard',
              completedCount: 634
            }
          ];
          
          setExams(mockExams);
        }
      } catch (error) {
        console.error('Error fetching subject data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubjectData();
  }, [subjectId]);
  
  if (isLoading) {
    return (
      <LoadingContainer theme={theme}>
        <p>Đang tải thông tin môn học...</p>
      </LoadingContainer>
    );
  }
  
  if (!subject) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Không tìm thấy môn học</h2>
          <p>Môn học yêu cầu không tồn tại hoặc đã bị xóa.</p>
          <Link to="/subjects">Quay lại danh sách môn học</Link>
        </div>
      </Container>
    );
  }
  
  const formatGradeLabel = (grade) => {
    return `Lớp ${grade}`;
  };
  
  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return 'Không xác định';
    }
  };
  
  return (
    <Container>
      <BreadcrumbNav theme={theme}>
        <Link to="/subjects">Các môn học</Link>
        <span>›</span>
        <span>{subject.title}</span>
      </BreadcrumbNav>
      
      <SubjectHeader
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SubjectImage image={subject.image}>
          <SubjectGradeBadge>{formatGradeLabel(subject.grade)}</SubjectGradeBadge>
        </SubjectImage>
        
        <SubjectInfo>
          <SubjectTitle theme={theme}>{subject.title}</SubjectTitle>
          <SubjectDescription theme={theme}>{subject.description}</SubjectDescription>
          
          <SubjectStats>
            <StatItem>
              <StatIcon theme={theme}>📝</StatIcon>
              <StatText theme={theme}>{subject.testsCount} bài thi</StatText>
            </StatItem>
            <StatItem>
              <StatIcon theme={theme}>👥</StatIcon>
              <StatText theme={theme}>Độ phổ biến: {subject.popularity}</StatText>
            </StatItem>
            <StatItem>
              <StatIcon theme={theme}>🔄</StatIcon>
              <StatText theme={theme}>Cập nhật: {subject.lastUpdated}</StatText>
            </StatItem>
          </SubjectStats>
        </SubjectInfo>
      </SubjectHeader>
      
      <SectionTitle theme={theme}>
        <span>📋</span> Đề thi có sẵn
      </SectionTitle>
      
      {exams.length > 0 ? (
        <ExamsGrid>
          {exams.map(exam => (
            <ExamCard 
              key={exam.id} 
              theme={theme}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <ExamContent>
                <ExamTitle theme={theme}>{exam.title}</ExamTitle>
                
                <ExamInfo theme={theme}>
                  <span>{exam.questions} câu hỏi</span>
                  <span>{exam.time} phút</span>
                </ExamInfo>
                
                <ExamDescription theme={theme}>{exam.description}</ExamDescription>
                
                <ExamMeta theme={theme}>
                  <ExamDifficulty>
                    <DifficultyDot level={exam.difficulty} />
                    <DifficultyText theme={theme}>
                      Độ khó: {getDifficultyLabel(exam.difficulty)}
                    </DifficultyText>
                  </ExamDifficulty>
                  
                  <StartButton to={`/exams/${exam.id}`}>
                    Bắt đầu làm bài
                  </StartButton>
                </ExamMeta>
              </ExamContent>
            </ExamCard>
          ))}
        </ExamsGrid>
      ) : (
        <NoExamsMessage theme={theme}>
          Chưa có đề thi nào cho môn học này. Vui lòng quay lại sau.
        </NoExamsMessage>
      )}
    </Container>
  );
};

export default SubjectDetail;
