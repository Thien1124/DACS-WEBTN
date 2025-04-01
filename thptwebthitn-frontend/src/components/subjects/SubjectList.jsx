import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  white-space: nowrap;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  flex: 1;
  min-width: 250px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SubjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const SubjectCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
`;

const SubjectImage = styled.div`
  height: 160px;
  background-image: ${props => `url(${props.image})`};
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
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

const SubjectContent = styled.div`
  padding: 1.25rem;
`;

const SubjectTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const SubjectDescription = styled.p`
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;  
  overflow: hidden;
`;

const SubjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};
  padding-top: 1rem;
  margin-top: 0.5rem;
`;

const SubjectTests = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
`;

const ViewButton = styled(Link)`
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

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  width: 100%;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-size: 1.1rem;
`;

const SubjectList = ({ theme }) => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filters, setFilters] = useState({
    grade: '',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch subjects
    const fetchSubjects = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockSubjects = [
          {
            id: 1,
            title: 'Toán học',
            description: 'Các khái niệm cơ bản về đại số, giải tích, hình học và thống kê. Bao gồm các bài tập từ cơ bản đến nâng cao.',
            image: 'https://img.freepik.com/free-vector/hand-drawn-mathematics-background_23-2148157511.jpg',
            grade: '10',
            testsCount: 24
          },
          {
            id: 2,
            title: 'Vật lý',
            description: 'Kiến thức về cơ học, nhiệt học, điện từ học, quang học và vật lý hiện đại, giúp học sinh hiểu sâu về các quy luật vật lý.',
            image: 'https://img.freepik.com/free-vector/physics-background-with-elements_23-2147607578.jpg',
            grade: '10',
            testsCount: 18
          },
          {
            id: 3,
            title: 'Hóa học',
            description: 'Các bài học về cấu trúc nguyên tử, liên kết hóa học, phản ứng hóa học, hóa hữu cơ và vô cơ.',
            image: 'https://img.freepik.com/free-vector/hand-drawn-chemistry-background_23-2148164901.jpg',
            grade: '10',
            testsCount: 15
          },
          {
            id: 4,
            title: 'Sinh học',
            description: 'Kiến thức về tế bào, di truyền học, sinh thái học, sinh lý học và tiến hóa, giúp học sinh hiểu về thế giới sống.',
            image: 'https://img.freepik.com/free-vector/hand-drawn-biology-background_23-2148157779.jpg',
            grade: '10',
            testsCount: 17
          },
          {
            id: 5,
            title: 'Ngữ văn',
            description: 'Các tác phẩm văn học Việt Nam và thế giới, kỹ năng đọc hiểu, phân tích và viết các thể loại văn bản.',
            image: 'https://img.freepik.com/free-photo/book-composition-with-open-book_23-2147690555.jpg',
            grade: '10',
            testsCount: 20
          },
          {
            id: 6,
            title: 'Lịch sử',
            description: 'Tổng quan về lịch sử Việt Nam và thế giới từ thời kỳ nguyên thủy đến hiện đại, giúp học sinh hiểu về quá khứ.',
            image: 'https://img.freepik.com/free-vector/realistic-history-concept-composition-with-image-history-textbook-with-colorful-bookmark-icons-characters-from-different-eras-vector-illustration_1284-79388.jpg',
            grade: '10',
            testsCount: 16
          },
          {
            id: 7,
            title: 'Địa lý',
            description: 'Kiến thức về địa lý tự nhiên và địa lý kinh tế-xã hội của Việt Nam và thế giới.',
            image: 'https://img.freepik.com/free-vector/geography-subject-concept_23-2148982602.jpg',
            grade: '10',
            testsCount: 14
          },
          {
            id: 8,
            title: 'Tiếng Anh',
            description: 'Ngữ pháp, từ vựng, các kỹ năng nghe, nói, đọc, viết tiếng Anh phù hợp với trình độ học sinh THPT.',
            image: 'https://img.freepik.com/free-vector/english-communication-collage-illustration_23-2149514626.jpg',
            grade: '10',
            testsCount: 25
          },
          {
            id: 9,
            title: 'Toán học nâng cao',
            description: 'Chương trình toán học chuyên sâu, tập trung vào các bài toán khó và nâng cao, chuẩn bị cho các kỳ thi lớn.',
            image: 'https://img.freepik.com/free-vector/realistic-math-chalkboard-background_23-2148163817.jpg',
            grade: '11',
            testsCount: 22
          },
          {
            id: 10,
            title: 'Vật lý nâng cao',
            description: 'Kiến thức vật lý chuyên sâu, bao gồm các bài tập và thí nghiệm nâng cao dành cho học sinh khối 11.',
            image: 'https://img.freepik.com/free-vector/physics-science-education-background-doodle-style_1284-54564.jpg',
            grade: '11',
            testsCount: 19
          },
          {
            id: 11,
            title: 'Hóa học hữu cơ',
            description: 'Kiến thức chuyên sâu về hóa hữu cơ, cấu trúc và phản ứng của các hợp chất hữu cơ dành cho học sinh khối 11.',
            image: 'https://img.freepik.com/free-vector/hand-drawn-chemistry-background_23-2148164893.jpg',
            grade: '11',
            testsCount: 16
          },
          {
            id: 12,
            title: 'Sinh học phát triển',
            description: 'Kiến thức nâng cao về sinh lý học động vật, thực vật và di truyền học phân tử dành cho học sinh khối 11.',
            image: 'https://img.freepik.com/free-vector/biology-concept-education-science-banner_107791-14404.jpg',
            grade: '11',
            testsCount: 15
          },
          {
            id: 13,
            title: 'Toán học – Ôn thi THPT Quốc gia',
            description: 'Ôn tập toàn diện các kiến thức toán học THPT, tập trung vào dạng bài và kỹ thuật giải nhanh cho kỳ thi tốt nghiệp.',
            image: 'https://img.freepik.com/free-vector/mathematics-collage-concept_23-2148161193.jpg',
            grade: '12',
            testsCount: 30
          },
          {
            id: 14,
            title: 'Vật lý – Ôn thi THPT Quốc gia',
            description: 'Tổng hợp kiến thức vật lý trọng tâm và các dạng bài tập thường gặp trong kỳ thi tốt nghiệp THPT.',
            image: 'https://img.freepik.com/free-vector/realistic-science-laboratory-equipment_107791-15384.jpg',
            grade: '12',
            testsCount: 28
          },
          {
            id: 15,
            title: 'Hóa học – Ôn thi THPT Quốc gia',
            description: 'Tổng hợp lý thuyết và bài tập hóa học quan trọng, tập trung vào các chuyên đề thường xuất hiện trong đề thi.',
            image: 'https://img.freepik.com/free-vector/realistic-science-laboratory-background_52683-63851.jpg',
            grade: '12',
            testsCount: 26
          },
          {
            id: 16,
            title: 'Sinh học – Ôn thi THPT Quốc gia',
            description: 'Ôn tập có hệ thống kiến thức sinh học từ lớp 10-12, tập trung vào các câu hỏi trọng tâm trong đề thi.',
            image: 'https://img.freepik.com/free-vector/realistic-science-laboratory-background_52683-63850.jpg',
            grade: '12',
            testsCount: 25
          },
          {
            id: 17,
            title: 'Ngữ văn – Ôn thi THPT Quốc gia',
            description: 'Ôn tập các tác phẩm văn học trọng điểm, kỹ năng làm văn nghị luận và phân tích tác phẩm.',
            image: 'https://img.freepik.com/free-photo/learning-education-ideas-insight-intelligence-study-concept_53876-120082.jpg',
            grade: '12',
            testsCount: 22
          },
          {
            id: 18,
            title: 'Tiếng Anh – Ôn thi THPT Quốc gia',
            description: 'Ôn tập ngữ pháp, từ vựng trọng tâm và chiến lược làm bài thi trắc nghiệm tiếng Anh hiệu quả.',
            image: 'https://img.freepik.com/free-vector/english-language-composition-with-flat-design_23-2147897071.jpg',
            grade: '12',
            testsCount: 30
          }
        ];
        
        setSubjects(mockSubjects);
        setFilteredSubjects(mockSubjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    // Filter subjects based on selected filters
    let results = [...subjects];
    
    // Filter by grade
    if (filters.grade) {
      results = results.filter(subject => subject.grade === filters.grade);
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(subject => 
        subject.title.toLowerCase().includes(searchTerm) || 
        subject.description.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredSubjects(results);
  }, [filters, subjects]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatGradeLabel = (grade) => {
    return `Lớp ${grade}`;
  };

  return (
    <Container
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FiltersContainer>
        <FilterGroup>
          <FilterLabel theme={theme} htmlFor="grade">Khối lớp:</FilterLabel>
          <Select 
            theme={theme}
            id="grade"
            name="grade"
            value={filters.grade}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả</option>
            <option value="10">Lớp 10</option>
            <option value="11">Lớp 11</option>
            <option value="12">Lớp 12</option>
          </Select>
        </FilterGroup>
        
        <SearchInput 
          theme={theme}
          type="text"
          placeholder="Tìm kiếm môn học..."
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
        />
      </FiltersContainer>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p>Đang tải danh sách môn học...</p>
        </div>
      ) : filteredSubjects.length > 0 ? (
        <SubjectsGrid>
          {filteredSubjects.map(subject => (
            <SubjectCard 
              key={subject.id} 
              theme={theme}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <SubjectImage image={subject.image}>
                <SubjectGradeBadge>{formatGradeLabel(subject.grade)}</SubjectGradeBadge>
              </SubjectImage>
              
              <SubjectContent>
                <SubjectTitle theme={theme}>{subject.title}</SubjectTitle>
                <SubjectDescription theme={theme}>{subject.description}</SubjectDescription>
                
                <SubjectMeta theme={theme}>
                  <SubjectTests theme={theme}>{subject.testsCount} bài thi</SubjectTests>
                  <ViewButton to={`/subjects/${subject.id}`}>Xem chi tiết</ViewButton>
                </SubjectMeta>
              </SubjectContent>
            </SubjectCard>
          ))}
        </SubjectsGrid>
      ) : (
        <NoResultsMessage theme={theme}>
          Không tìm thấy môn học nào phù hợp với bộ lọc đã chọn.
        </NoResultsMessage>
      )}
    </Container>
  );
};

export default SubjectList;
