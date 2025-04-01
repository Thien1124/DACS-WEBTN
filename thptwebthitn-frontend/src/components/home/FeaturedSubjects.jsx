import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SectionContainer = styled.div`
  padding: 5rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
`;

const SectionContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #007bff, #00d6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SectionDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#555'};
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

const SubjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const SubjectCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
`;

const SubjectImage = styled.div`
  height: 180px;
  background-image: ${props => `url(${props.image})`};
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.6));
  }
`;

const SubjectGrade = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
  background-color: rgba(0, 123, 255, 0.9);
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0.3rem 0.8rem;
  border-radius: 30px;
`;

const SubjectContent = styled.div`
  padding: 1.5rem;
`;

const SubjectTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const SubjectDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;  
  overflow: hidden;
`;

const SubjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};
`;

const MetaItem = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ViewButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
  }
`;

const MoreLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 3rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
  text-decoration: none;
  font-size: 1.1rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FeaturedSubjects = ({ theme }) => {
  // Sample data for featured subjects
  const featuredSubjects = [
    {
      id: "1",
      title: 'Toán học',
      description: 'Môn học cơ bản về đại số, giải tích và hình học với các bài tập từ cơ bản đến nâng cao. Phát triển tư duy logic và kỹ năng giải quyết vấn đề.',
      image: 'https://img.freepik.com/free-vector/hand-drawn-mathematics-background_23-2148157511.jpg',
      grade: 'Lớp 10',
      tests: 24,
      students: 1250
    },
    {
      id: "14",
      title: 'Vật lý – Ôn thi THPT Quốc gia',
      description: 'Tổng hợp kiến thức vật lý trọng tâm và các dạng bài tập thường gặp trong kỳ thi tốt nghiệp THPT. Từ cơ học đến điện từ học và vật lý hiện đại.',
      image: 'https://img.freepik.com/free-vector/realistic-science-laboratory-equipment_107791-15384.jpg',
      grade: 'Lớp 12',
      tests: 28,
      students: 980
    },
    {
      id: "8",
      title: 'Tiếng Anh',
      description: 'Ngữ pháp, từ vựng, và các kỹ năng nghe, nói, đọc, viết tiếng Anh phù hợp với trình độ học sinh THPT. Chuẩn bị tốt cho các kỳ thi.',
      image: 'https://img.freepik.com/free-vector/english-communication-collage-illustration_23-2149514626.jpg',
      grade: 'Lớp 10',
      tests: 25,
      students: 1420
    },
    {
      id: "18",
      title: 'Tiếng Anh – Ôn thi THPT Quốc gia',
      description: 'Ôn tập ngữ pháp, từ vựng trọng tâm và chiến lược làm bài thi trắc nghiệm tiếng Anh hiệu quả. Bộ đề thi thử đầy đủ và cập nhật.',
      image: 'https://img.freepik.com/free-vector/english-language-composition-with-flat-design_23-2147897071.jpg',
      grade: 'Lớp 12',
      tests: 30,
      students: 1150
    }
  ];

  return (
    <SectionContainer theme={theme}>
      <SectionContent>
        <SectionHeader>
          <SectionTitle>Môn Học Nổi Bật</SectionTitle>
          <SectionDescription theme={theme}>
            Khám phá các môn học phổ biến với hàng ngàn câu hỏi và bài tập.
            Chuẩn bị tốt nhất cho kỳ thi THPT Quốc gia với hệ thống kiến thức được biên soạn bởi đội ngũ giáo viên giàu kinh nghiệm.
          </SectionDescription>
        </SectionHeader>
        
        <SubjectsGrid>
          {featuredSubjects.map((subject, index) => (
            <SubjectCard 
              key={subject.id} 
              theme={theme}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <SubjectImage image={subject.image}>
                <SubjectGrade>{subject.grade}</SubjectGrade>
              </SubjectImage>
              
              <SubjectContent>
                <SubjectTitle theme={theme}>{subject.title}</SubjectTitle>
                <SubjectDescription theme={theme}>{subject.description}</SubjectDescription>
                
                <SubjectMeta theme={theme}>
                  <MetaItem theme={theme}>
                    <i className="fas fa-book"></i> {subject.tests} bài thi
                  </MetaItem>
                  <MetaItem theme={theme}>
                    <i className="fas fa-users"></i> {subject.students} học sinh
                  </MetaItem>
                </SubjectMeta>
                
                <ViewButton to={`/subjects/${subject.id}`}>
                  Xem chi tiết <i className="fas fa-arrow-right"></i>
                </ViewButton>
              </SubjectContent>
            </SubjectCard>
          ))}
        </SubjectsGrid>
        
        <MoreLink theme={theme} to="/subjects">
          Xem tất cả môn học <i className="fas fa-long-arrow-alt-right"></i>
        </MoreLink>
      </SectionContent>
    </SectionContainer>
  );
};

export default FeaturedSubjects;
