import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { motion } from "framer-motion";
import { fetchSubjectById } from "../../redux/subjectSlice";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorDisplay from "../common/ErrorDisplay";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {
  FaArrowLeft,
  FaRegFileAlt,
  FaUserAlt,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaBookOpen,
  FaCalendarAlt,
  FaCode,
  FaInfoCircle,
  FaHistory,
  FaSearch,
  FaClock,
  FaQuestionCircle,
  FaChartLine,
  FaTrophy,
} from "react-icons/fa";

// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${(props) =>
    props.theme === "dark" ? "#1a1a1a" : "#f5f8fa"};
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
    color: ${(props) => (props.theme === "dark" ? "#4da3ff" : "#4285f4")};
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }

  span {
    margin: 0 0.75rem;
    color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
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
  background-image: ${(props) =>
    `url(${
      props.image || "https://via.placeholder.com/320x220?text=Môn+học"
    })`};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.6)
    );
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
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
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
  background-color: ${(props) =>
    props.theme === "dark" ? "#2d3748" : "#edf2f7"};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const SubjectDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#4a5568")};
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
  color: ${(props) => (props.theme === "dark" ? "#4da3ff" : "#4285f4")};
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${(props) => (props.theme === "dark" ? "#1a202c" : "#ebf8ff")};
  border-radius: 50%;
`;

const StatText = styled.span`
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
  font-weight: 500;
  font-size: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 2.5rem 0 1.5rem;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.75rem;

  &::after {
    content: "";
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
  background-color: ${(props) =>
    props.theme === "dark" ? "#2a2a2a" : "white"};
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const DetailLabel = styled.div`
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
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
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
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

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background-color: ${(props) =>
    props.theme === "dark" ? "#2d3748" : "#f5f7fa"};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "#4a5568" : "#e2e8f0"};
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const ContentBox = styled.div`
  background-color: ${(props) =>
    props.theme === "dark" ? "#2a2a2a" : "white"};
  border-radius: 15px;
  padding: 2rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  line-height: 1.8;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};

  h3 {
    color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }

  p {
    margin-bottom: 1rem;
  }

  ul,
  ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const NoContentMessage = styled.div`
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
  font-style: italic;
  text-align: center;
  padding: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;

  p {
    margin-top: 1rem;
    color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#4a5568")};
    font-size: 1.1rem;
  }
`;

const BackNavigationRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const HistoryButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background-color: ${(props) =>
    props.theme === "dark" ? "#2d3748" : "#f5f7fa"};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "#4a5568" : "#e2e8f0"};
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${(props) =>
    props.theme === "dark" ? "#2d3748" : "#f5f7fa"};
  border-radius: 8px;
  padding: 0.5rem;
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
  padding: 0.5rem;
  font-size: 1rem;
  outline: none;
  width: 200px;
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
  cursor: pointer;
  padding: 0.5rem;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
  background-color: ${(props) =>
    props.active ? "#4285f4" : props.theme === "dark" ? "#2d3748" : "#f5f7fa"};
  color: ${(props) =>
    props.active ? "white" : props.theme === "dark" ? "#e2e8f0" : "#4a5568"};
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: ${(props) =>
      props.active
        ? "#4285f4"
        : props.theme === "dark"
        ? "#4a5568"
        : "#e2e8f0"};
  }
`;

const ExamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ExamCard = styled.div`
  background-color: ${(props) =>
    props.theme === "dark" ? "#2a2a2a" : "white"};
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const ExamTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;

const ExamDetails = styled.div`
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const ExamActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StartButton = styled.button`
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #357ae8;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
  font-style: italic;
  padding: 2rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  background-color: ${(props) =>
    props.active ? "#4285f4" : props.theme === "dark" ? "#2d3748" : "#f5f7fa"};
  color: ${(props) =>
    props.active ? "white" : props.theme === "dark" ? "#e2e8f0" : "#4a5568"};
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  margin: 0 0.25rem;

  &:hover {
    background-color: ${(props) =>
      props.active
        ? "#4285f4"
        : props.theme === "dark"
        ? "#4a5568"
        : "#e2e8f0"};
  }
`;

const SubjectDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.ui);
  const { selectedSubject, loading, error } = useSelector(
    (state) => state.subjects
  );
  const user = useSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const exams = selectedSubject?.exams || [];
  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (difficulty === "all" || exam.difficulty === difficulty)
  );
  const totalPages = Math.ceil(filteredExams.length / 10);

  // Sử dụng thời gian và người dùng hiện tại
  const currentTime = "2025-04-13 16:57:17";
  const currentUser = "vinhsonvlog";

  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    // The filtering is already handled by the filteredExams variable
  };

  // Convert difficulty code to readable text
  const getDifficultyText = (difficulty) => {
    const difficultyMap = {
      easy: "Dễ",
      medium: "Trung bình",
      hard: "Khó",
    };
    return difficultyMap[difficulty] || "Không xác định";
  };

  // Handle exam start button click
  const handleStartExam = (examId) => {
    navigate(`/exams/${examId}`);
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchSubjectById(id));
    }
  }, [id, dispatch]);

  // Helper function to get subject image
  const getSubjectImage = () => {
    if (!selectedSubject || typeof selectedSubject.name !== "string") {
      return "https://via.placeholder.com/320x220?text=Môn+học";
    }

    // Thử lấy từ các thuộc tính có thể chứa hình ảnh
    const possibleImageProps = ["image", "imageUrl", "img", "thumbnail"];
    for (const prop of possibleImageProps) {
      if (selectedSubject[prop]) {
        return selectedSubject[prop];
      }
    }

    // Nếu không có, dùng ảnh mặc định theo tên môn học
    const defaultImages = {
      Toán: "/assets/images/math.png",
      "Vật Lý": "/assets/images/physics.png",
      "Hóa Học": "/assets/images/chemistry.png",
      "Sinh Học": "/assets/images/biology.png",
      "Ngữ Văn": "/assets/images/literature.png",
      "Tiếng Anh": "/assets/images/english.png",
      "Lịch Sử": "/assets/images/history.png",
      "Địa Lý": "/assets/images/geography.png",
    };

    const subjectName = selectedSubject.name.trim();

    // Kiểm tra từ khóa trong tên môn học và trả về ảnh tương ứng
    for (const keyword in defaultImages) {
      if (subjectName.includes(keyword)) {
        return defaultImages[keyword];
      }
    }

    // Fallback: Nếu không tìm thấy từ khóa phù hợp, trả về ảnh placeholder
    return "https://via.placeholder.com/320x220?text=Môn+học";
  };

  // Hàm để lấy mô tả về nội dung môn học dựa trên khối lớp
  const getSubjectContentDescription = (grade) => {
    if (!grade) return null;

    const gradeContent = {
      10: {
        Toán: "Chương trình Toán lớp 10 bao gồm Đại số và Hình học, giúp học sinh nắm vững kiến thức cơ bản về tập hợp, hàm số, phương trình, hệ phương trình và hình học phẳng Oxy.",
        "Vật Lý":
          "Chương trình Vật lý lớp 10 bao gồm các chủ đề về động học, động lực học, công và năng lượng, giúp học sinh hiểu rõ các quy luật vận động cơ bản.",
        "Hóa Học":
          "Chương trình Hóa học lớp 10 tập trung vào cấu tạo nguyên tử, bảng tuần hoàn, liên kết hóa học và các định luật cơ bản của hóa học.",
        "Sinh Học":
          "Chương trình Sinh học lớp 10 giới thiệu về tế bào học, sinh học phân tử và di truyền học cơ bản.",
        "Địa Lý":
          "Chương trình Địa lý lớp 10 nghiên cứu về địa lý tự nhiên của Việt Nam và thế giới, bao gồm các đặc điểm về địa hình, khí hậu và tài nguyên.",
      },
      11: {
        Toán: "Chương trình Toán lớp 11 nâng cao kiến thức với các chủ đề về giới hạn, đạo hàm, tích phân và hình học không gian.",
        "Vật Lý":
          "Chương trình Vật lý lớp 11 nghiên cứu về điện từ học, dao động và sóng, giúp học sinh hiểu rõ các hiện tượng vật lý phức tạp hơn.",
        "Hóa Học":
          "Chương trình Hóa học lớp 11 bao gồm các chủ đề về phản ứng oxi hóa khử, dung dịch, điện hóa và các nguyên tố phi kim.",
        "Sinh Học":
          "Chương trình Sinh học lớp 11 tập trung vào sinh lý học thực vật và động vật, sinh thái học và tiến hóa.",
        "Địa Lý":
          "Chương trình Địa lý lớp 11 nghiên cứu về địa lý kinh tế - xã hội của Việt Nam và thế giới.",
      },
      12: {
        Toán: "Chương trình Toán lớp 12 hoàn thiện kiến thức với các chủ đề về số phức, tổ hợp, xác suất, thống kê và nâng cao hình học không gian.",
        "Vật Lý":
          "Chương trình Vật lý lớp 12 nghiên cứu về vật lý lượng tử, vật lý hạt nhân và quang học sóng, giúp hoàn thiện kiến thức vật lý THPT.",
        "Hóa Học":
          "Chương trình Hóa học lớp 12 tập trung vào hóa học hữu cơ và các ứng dụng của hóa học trong đời sống và công nghiệp.",
        "Sinh Học":
          "Chương trình Sinh học lớp 12 nghiên cứu về di truyền nâng cao, công nghệ sinh học và ứng dụng của sinh học trong đời sống.",
        "Địa Lý":
          "Chương trình Địa lý lớp 12 hoàn thiện kiến thức về địa lý kinh tế - xã hội của các vùng miền Việt Nam và các khu vực trên thế giới.",
      },
    };

    // Lấy thông tin theo khối lớp và tên môn học
    if (
      gradeContent[grade] &&
      selectedSubject &&
      gradeContent[grade][selectedSubject.name]
    ) {
      return gradeContent[grade][selectedSubject.name];
    }

    // Mô tả chung nếu không có thông tin cụ thể
    return `Chương trình học lớp ${grade} theo chuẩn của Bộ Giáo dục và Đào tạo, giúp học sinh xây dựng nền tảng kiến thức vững chắc cho kỳ thi THPT Quốc gia.`;
  };

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
      </PageWrapper>
    );
  }

  const subjectContent =
    selectedSubject?.content ||
    getSubjectContentDescription(selectedSubject?.grade);

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
          <span>{selectedSubject?.name || "Chi tiết môn học"}</span>
        </BreadcrumbNav>

        {selectedSubject && (
          <>
            <BackNavigationRow>
              <BackButton onClick={() => navigate("/subjects")}>
                <FaArrowLeft /> Quay lại danh sách môn học
              </BackButton>
              {user && (
                <HistoryButton onClick={() => navigate("/exam-history")}>
                  <FaHistory /> Xem lịch sử bài thi
                </HistoryButton>
              )}
            </BackNavigationRow>

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
                  {selectedSubject.description ||
                    "Không có mô tả cho môn học này."}
                </SubjectDescription>

                <SubjectStats>
                  <StatItem>
                    <StatIcon theme={theme}>
                      <FaGraduationCap />
                    </StatIcon>
                    <StatText theme={theme}>
                      {selectedSubject.grade
                        ? `Lớp ${selectedSubject.grade}`
                        : "Tất cả các lớp"}
                    </StatText>
                  </StatItem>

                  <StatItem>
                    <StatIcon theme={theme}>
                      <FaRegFileAlt />
                    </StatIcon>
                    <StatText theme={theme}>
                      {selectedSubject.examCount || 0} đề thi
                    </StatText>
                  </StatItem>

                  <StatItem>
                    <StatIcon theme={theme}>
                      <FaUserAlt />
                    </StatIcon>
                    <StatText theme={theme}>
                      {selectedSubject.teacherCount || 0} giáo viên
                    </StatText>
                  </StatItem>
                </SubjectStats>
              </SubjectInfo>
            </SubjectHeader>

            <SectionTitle theme={theme}>
              <FaInfoCircle />
              Thông tin môn học
            </SectionTitle>

            <DetailSection theme={theme}>
              <DetailItem>
                <DetailLabel theme={theme}>Khối lớp</DetailLabel>
                <DetailValue theme={theme}>
                  {selectedSubject.grade ? (
                    <GradeTag>Lớp {selectedSubject.grade}</GradeTag>
                  ) : (
                    "Tất cả các lớp"
                  )}
                </DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel theme={theme}>Mã môn học</DetailLabel>
                <DetailValue theme={theme}>
                  {selectedSubject.code || "Không có mã"}
                </DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel theme={theme}>Số tiết/tuần</DetailLabel>
                <DetailValue theme={theme}>
                  {selectedSubject.numberOfLessons || "3-5"} tiết
                </DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel theme={theme}>Loại môn học</DetailLabel>
                <DetailValue theme={theme}>
                  {selectedSubject.type ||
                    (selectedSubject.isOptional
                      ? "Môn tự chọn"
                      : "Môn bắt buộc")}
                </DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel theme={theme}>Trạng thái</DetailLabel>
                <DetailValue theme={theme}>
                  <span
                    style={{
                      color: selectedSubject.isActive ? "#34a853" : "#ea4335",
                      fontWeight: 500,
                    }}
                  >
                    {selectedSubject.isActive
                      ? "● Đang hoạt động"
                      : "● Đã khóa"}
                  </span>
                </DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel theme={theme}>Năm học</DetailLabel>
                <DetailValue theme={theme}>
                  {selectedSubject.schoolYear || "2025-2026"}
                </DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel theme={theme}>Ngày cập nhật</DetailLabel>
                <DetailValue theme={theme}>
                  {selectedSubject.updatedAt
                    ? new Date(selectedSubject.updatedAt).toLocaleDateString(
                        "vi-VN"
                      )
                    : "Chưa cập nhật"}
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
                  Chưa có thông tin chi tiết về nội dung chương trình học của
                  môn này.
                </NoContentMessage>
              )}
            </ContentBox>

            <SectionTitle>Đề Thi Có Sẵn</SectionTitle>

            {/* Khu vực lọc đề thi */}
            <FiltersRow>
              <SearchContainer>
                <SearchInput
                  type="text"
                  placeholder="Tìm kiếm đề thi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchButton onClick={handleSearch}>
                  <FaSearch />
                </SearchButton>
              </SearchContainer>

              <FilterButtons>
                <FilterButton
                  active={difficulty === "all"}
                  onClick={() => setDifficulty("all")}
                >
                  Tất cả
                </FilterButton>
                <FilterButton
                  active={difficulty === "easy"}
                  onClick={() => setDifficulty("easy")}
                >
                  Dễ
                </FilterButton>
                <FilterButton
                  active={difficulty === "medium"}
                  onClick={() => setDifficulty("medium")}
                >
                  Trung bình
                </FilterButton>
                <FilterButton
                  active={difficulty === "hard"}
                  onClick={() => setDifficulty("hard")}
                >
                  Khó
                </FilterButton>
              </FilterButtons>
            </FiltersRow>

            {/* Hiển thị danh sách đề thi */}
            {loading ? (
              <LoadingSpinner />
            ) : exams.length > 0 ? (
              <ExamsGrid>
                {filteredExams.map((exam) => (
                  <ExamCard key={exam.id}>
                    <ExamTitle>{exam.title}</ExamTitle>
                    <ExamDetails>
                      <DetailItem>
                        <FaClock /> {exam.duration} phút
                      </DetailItem>
                      <DetailItem>
                        <FaQuestionCircle /> {exam.questionCount} câu hỏi
                      </DetailItem>
                      <DetailItem>
                        <FaChartLine /> Độ khó:{" "}
                        {getDifficultyText(exam.difficulty)}
                      </DetailItem>
                    </ExamDetails>
                    <ExamActions>
                      <StartButton onClick={() => handleStartExam(exam.id)}>
                        Bắt đầu làm bài
                      </StartButton>
                    </ExamActions>
                  </ExamCard>
                ))}
              </ExamsGrid>
            ) : (
              <EmptyMessage>Không có đề thi nào cho môn học này</EmptyMessage>
            )}

            {/* Phân trang */}
            {totalPages > 1 && (
              <Pagination>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PageButton
                    key={i}
                    active={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PageButton>
                ))}
              </Pagination>
            )}

            <ButtonsRow>
              <BackButton to="/subjects" theme={theme}>
                <FaArrowLeft /> Quay lại danh sách môn học
              </BackButton>

              <div>
                <ActionButton
                  onClick={() => navigate(`/subjects/${id}/exams`)}
                  style={{ marginRight: "1rem" }}
                >
                  <FaRegFileAlt /> Xem danh sách đề thi
                </ActionButton>

                {selectedSubject.canEdit && (
                  <ActionButton
                    onClick={() => navigate(`/subject/edit/${id}`)}
                    style={{
                      background: theme === "dark" ? "#2d3748" : "#f5f7fa",
                      color: theme === "dark" ? "#e2e8f0" : "#4a5568",
                    }}
                  >
                    <FaChalkboardTeacher /> Chỉnh sửa môn học
                  </ActionButton>
                )}
                <ActionButton
                  as={Link}
                  to={`/leaderboard/subjects`}
                  style={{
                    background: theme === "dark" ? "#2d3748" : "#f5f7fa",
                    color: theme === "dark" ? "#e2e8f0" : "#4a5568",
                  }}
                >
                  <FaTrophy /> Bảng xếp hạng
                </ActionButton>
              </div>
            </ButtonsRow>
          </>
        )}

        {/* Thông tin truy cập */}
        <div
          style={{
            marginTop: "3rem",
            fontSize: "0.8rem",
            color: theme === "dark" ? "#718096" : "#a0aec0",
            textAlign: "right",
          }}
        >
          Truy cập vào lúc: {currentTime} | Người dùng: {currentUser}
        </div>
      </Container>

      <Footer />
    </PageWrapper>
  );
};

export default SubjectDetail;
