import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPowerOff,
  FaCrown,
  FaChalkboardTeacher,
  FaSearch,
  FaHome,
  FaFilter,
  FaRedo,
  FaBook,
  FaFileAlt
} from "react-icons/fa";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Pagination from "../components/common/Pagination";
import SubjectNavigation from "../components/subjects/SubjectNavigation";
import MathImg from "../assets/images/math.png";
import PhysicsImg from "../assets/images/physic.png";
import ChemistryImg from "../assets/images/chemistry.png";
import BiologyImg from "../assets/images/biology.png";
import LiteratureImg from "../assets/images/literature.png";
import EnglishImg from "../assets/images/english.png";
import HistoryImg from "../assets/images/history.png";
import GeographyImg from "../assets/images/geography.png";
import CivicEdu from "../assets/images/civic.png";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${(props) =>
    props.theme === "dark" ? "#1a1a1a" : "#f5f8fa"};
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
  margin-bottom: 1.5rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FiltersTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
  width: 100%;
`;
const SubjectCard = styled(motion.div)`
  background-color: ${(props) =>
    props.theme === "dark" ? "#2d2d2d" : "white"};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  padding: 1.25rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SubjectImageContainer = styled.div`
  height: 160px;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  position: relative;
  margin: -1.25rem -1.25rem 1rem -1.25rem;
`;

const SubjectImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;

  ${SubjectCard}:hover & {
    transform: scale(1.05);
}

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%);
  }
`;

const SubjectImageOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 2;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;

  svg {
    margin-right: 5px;
  }
`;
const FiltersGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  flex: 1;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
`;

const SearchInput = styled.div`
  position: relative;

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid
      ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
    border-radius: 8px;
    background-color: ${(props) =>
      props.theme === "dark" ? "#2d2d2d" : "white"};
    color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: ${(props) =>
        props.theme === "dark" ? "#4da3ff" : "#4285f4"};
    }
  }

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${(props) => (props.theme === "dark" ? "#718096" : "#a0aec0")};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid
    ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
  border-radius: 8px;
  background-color: ${(props) =>
    props.theme === "dark" ? "#2d2d2d" : "white"};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.theme === "dark" ? "#4da3ff" : "#4285f4"};
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
`;

const SubjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;


const SubjectHeader = styled.div`
  margin-bottom: 1rem;
  padding: 0 1.25rem;
`;

const SubjectTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;
const SubjectCode = styled.div`
  font-size: 0.9rem;
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
  font-weight: 500;
`;

const SubjectDescription = styled.p`
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
  margin-bottom: 1rem;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.8rem;
  padding: 0 1.25rem;
`;

const SubjectFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding: 0 1.25rem;
`;

const SubjectGrade = styled.div`
  font-size: 0.85rem;
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
  padding: 0.25rem 0.5rem;
  background-color: ${(props) =>
    props.theme === "dark" ? "#2a2a2a" : "#f7fafc"};
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButtons = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  background-color: ${(props) =>
    props.bgColor || (props.theme === "dark" ? "#4a5568" : "#4285f4")};
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-left: 0.8rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    background-color: ${(props) =>
      props.hoverColor || (props.theme === "dark" ? "#718096" : "#3367d6")};
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const ButtonAction = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;

  &.view {
    background-color: ${(props) =>
      props.theme === "dark" ? "#4285f4" : "#4285f4"};
    color: white;

    &:hover {
      background-color: ${(props) =>
        props.theme === "dark" ? "#3367d6" : "#3367d6"};
    }
  }

  &.edit {
    background-color: ${(props) =>
      props.theme === "dark" ? "#f6ad55" : "#f6ad55"};
    color: white;

    &:hover {
      background-color: ${(props) =>
        props.theme === "dark" ? "#dd6b20" : "#dd6b20"};
    }
  }

  &.delete {
    background-color: ${(props) =>
      props.theme === "dark" ? "#f56565" : "#f56565"};
    color: white;

    &:hover {
      background-color: ${(props) =>
        props.theme === "dark" ? "#e53e3e" : "#e53e3e"};
    }
  }

  &.status {
    background-color: ${(props) =>
      props.theme === "dark" ? "#38b2ac" : "#38b2ac"};
    color: white;

    &:hover {
      background-color: ${(props) =>
        props.theme === "dark" ? "#2c7a7b" : "#2c7a7b"};
    }
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: ${(props) =>
    props.theme === "dark" ? "#4a2a2a" : "#fff5f5"};
  color: ${(props) => (props.theme === "dark" ? "#f56565" : "#e53e3e")};
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: ${(props) =>
    props.theme === "dark" ? "#2d2d2d" : "white"};
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;

const EmptyDescription = styled.p`
  color: ${(props) => (props.theme === "dark" ? "#a0aec0" : "#718096")};
  margin-bottom: 1.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;



const HomeButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: ${(props) =>
    props.theme === "dark" ? "#4a5568" : "#e2e8f0"};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    margin-right: 0.5rem;
  }

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "#718096" : "#cbd5e0"};
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: ${(props) =>
    props.theme === "dark" ? "#4285f4" : "#4285f4"};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    margin-right: 0.5rem;
  }

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "#3367d6" : "#3367d6"};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(66, 133, 244, 0.3);
  }
`;

const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: ${(props) =>
    props.theme === "dark" ? "#718096" : "#edf2f7"};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    margin-right: 0.5rem;
  }

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "#4a5568" : "#e2e8f0"};
  }
`;

const RefreshButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.theme === "dark" ? "#4285f4" : "#4285f4"};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  z-index: 10;

  &:hover {
    transform: rotate(30deg);
    background-color: ${(props) =>
      props.theme === "dark" ? "#3367d6" : "#3367d6"};
  }
`;

const EndpointStatus = styled.div`
  font-size: 0.75rem;
  color: ${(props) => (props.connected ? "#48bb78" : "#f56565")};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;

  &:before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.5rem;
    background-color: ${(props) => (props.connected ? "#48bb78" : "#f56565")};
  }
`;

const SubjectsPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiConnected, setApiConnected] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    grade: "all",
    sortBy: "name",
  });
  const themeFromStore = useSelector((state) => state.ui?.theme);
  const [theme, setTheme] = useState(themeFromStore || "light");
  // Cập nhật thời gian và user
  const currentTime = "2025-04-08 11:22:37";
  const currentUser = "vinhsonvlog";
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage=8;
  // Chức năng tải lại dữ liệu
  const refreshData = async () => {
    setLoading(true);
    setError("");
    await getSubjects();
  };

  // Mock function cho getAllSubjects
  const getAllSubjects = async () => {
    // Trong môi trường thực, đây sẽ là API call
    const response = await fetch("http://localhost:5006/api/Subject"); // Gọi API thật
    const data = await response.json();
    return data;
  };

  // Mock function cho queryMultipleEndpoints
  const queryMultipleEndpoints = async () => {
    // Trong môi trường thực, đây sẽ là API call đến nhiều endpoints
    return await getAllSubjects();
  };

  // Load subjects
  const getSubjects = async () => {
    try {
      setLoading(true);
      console.log(`[${currentTime}] Fetching subjects...`);

      let data;

      try {
        // Thử gọi API thông thường
        data = await getAllSubjects();
      } catch (initialError) {
        console.error(
          `[${currentTime}] Initial API call failed:`,
          initialError
        );

        // Nếu lỗi, thử truy vấn nhiều endpoint
        try {
          console.log(`[${currentTime}] Trying multiple endpoints...`);
          data = await queryMultipleEndpoints();

          if (!data) {
            throw new Error("Không thể kết nối với API");
          }
        } catch (multiEndpointError) {
          console.error(
            `[${currentTime}] All API attempts failed:`,
            multiEndpointError
          );
          throw new Error("Không thể kết nối với máy chủ API");
        }
      }

      console.log(`[${currentTime}] Data received:`, data);

      if (data && data.data && Array.isArray(data.data)) {
        setSubjects(data.data); // Đảm bảo lưu đúng danh sách môn học từ API
        console.log(`[${currentTime}] Setting ${data.data.length} subjects`);
        setApiConnected(true);
      } else {
        console.error(`[${currentTime}] Unexpected data format:`, data);
        setError("Dữ liệu từ API không đúng định dạng");
        setSubjects([]);
      }
    } catch (error) {
      console.error(`[${currentTime}] Error fetching subjects:`, error);
      setError(error.message || "Không thể tải dữ liệu môn học");
      setApiConnected(false);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    // Log truy cập
    console.log(
      `Subjects page accessed at: ${currentTime} by user: ${currentUser}`
    );

    // Fetch subjects
    getSubjects();
  }, []);
  const subjectImageMap = {
    'Toán': MathImg,
    'Vật Lý': PhysicsImg,
    'Hóa Học': ChemistryImg,
    'Sinh Học': BiologyImg,
    'Ngữ Văn': LiteratureImg,
    'Tiếng Anh': EnglishImg,
    'Lịch Sử': HistoryImg,
    'Địa Lý': GeographyImg,
    'GDCD': CivicEdu
    // Thêm các môn học khác nếu có
  };
  // Hàm lấy ảnh cho môn học
  const getSubjectImage = (subject) => {
    // Nếu môn học đã có ảnh, sử dụng nó
    if (subject.img) {
      return subject.img;
    }
    
    // Kiểm tra tên môn học để lấy ảnh phù hợp
    for (const [key, image] of Object.entries(subjectImageMap)) {
      if (subject.name && subject.name.includes(key)) {
        return image;
      }
    }
    
    // Mặc định sử dụng DefaultSubjectImg nếu đã import
    // Hoặc một URL fallback
    return 'https://th.bing.com/th/id/R.2e5199e2fc082abc56808506b3160abb?rik=Cl5LtOqm9qt7Kg&pid=ImgRaw&r=0';
  };
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };
  const handleClearFilters = () => {
    setFilters({ search: "", grade: "all", sortBy: "name" });
    setCurrentPage(1);
  };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Filter subjects based on current filters
  const filteredSubjects = subjects
    .filter((subject) => {
      // Filter by search query
      if (
        filters.search &&
        !subject.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !subject.code?.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Filter by grade if applicable
      if (
        filters.grade !== "all" &&
        subject.grade &&
        subject.grade !== filters.grade
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort subjects
      switch (filters.sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "nameDesc":
          return (b.name || "").localeCompare(a.name || "");
        case "code":
          return (a.code || "").localeCompare(b.code || "");
        case "codeDesc":
          return (b.code || "").localeCompare(a.code || "");
        default:
          return 0;
      }
    });
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSubjects = filteredSubjects.slice(startIndex, endIndex);
    const totalFilteredPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  
    return (
      <PageContainer theme={theme}>
        <Header />
  
        <ContentContainer>
          <PageTitle theme={theme}>Danh sách môn học</PageTitle>
          <UserInfo theme={theme}>
            <span>Giáo viên</span>
            <span>
              Truy cập vào: lúc {currentTime} | Người dùng: {currentUser}
            </span>
          </UserInfo>
  
          {/* API connection status */}
          <EndpointStatus connected={apiConnected}>
            {apiConnected
              ? "API kết nối thành công"
              : "Không thể kết nối đến API"}
          </EndpointStatus>
  
          {/* Navigation and filters... */}
          <SubjectNavigation theme={theme} showOnlyCreateButton={true} />
  
          <FiltersContainer theme={theme}>
            <FiltersTitle theme={theme}>Tìm kiếm môn học phù hợp</FiltersTitle>
            <FiltersGrid>
              <FilterGroup>
                <FilterLabel theme={theme}>Tìm kiếm theo tên</FilterLabel>
                <SearchInput theme={theme}>
                  <FaSearch />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Nhập tên môn học..."
                  />
                </SearchInput>
              </FilterGroup>
  
              <FilterGroup>
                <FilterLabel theme={theme}>Khối lớp</FilterLabel>
                <Select
                  name="grade"
                  value={filters.grade}
                  onChange={handleFilterChange}
                  theme={theme}
                >
                  <option value="all">Tất cả khối lớp</option>
                  <option value="10">Lớp 10</option>
                  <option value="11">Lớp 11</option>
                  <option value="12">Lớp 12</option>
                </Select>
              </FilterGroup>
  
              <FilterGroup>
                <FilterLabel theme={theme}>Sắp xếp theo</FilterLabel>
                <Select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  theme={theme}
                >
                  <option value="name">Tên A-Z</option>
                  <option value="nameDesc">Tên Z-A</option>
                  <option value="code">Mã môn học A-Z</option>
                  <option value="codeDesc">Mã môn học Z-A</option>
                </Select>
              </FilterGroup>
              
              <ClearFiltersButton 
                onClick={handleClearFilters}
                theme={theme}
                style={{ display: (filters.search || filters.grade !== "all") ? 'flex' : 'none' }}
              >
                <FaFilter /> Xóa bộ lọc
              </ClearFiltersButton>
            </FiltersGrid>
          </FiltersContainer>
  
          {loading ? (
            <LoadingMessage theme={theme}>
              <LoadingSpinner />
              Đang tải dữ liệu...
            </LoadingMessage>
          ) : error ? (
            <ErrorMessage theme={theme}>{error}</ErrorMessage>
          ) : filteredSubjects.length > 0 ? (
            <>
              <SubjectsGrid>
                {paginatedSubjects.map((subject, index) => (
                  <SubjectCard 
                    key={subject.id || index} 
                    theme={theme}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SubjectImageContainer>
                      <SubjectImage image={getSubjectImage(subject)} />
                      <SubjectImageOverlay>
                        <FaFileAlt /> {subject.examCount || 0} đề thi
                      </SubjectImageOverlay>
                    </SubjectImageContainer>
                    
                    <SubjectHeader>
                      <SubjectTitle theme={theme}>{subject.name}</SubjectTitle>
                      <SubjectCode theme={theme}>{subject.code}</SubjectCode>
                    </SubjectHeader>
  
                    <SubjectDescription theme={theme}>
                      {subject.description || "Không có mô tả"}
                    </SubjectDescription>
                    
                    <SubjectFooter>
                      <SubjectGrade theme={theme}>
                        {subject.grade ? `Khối ${subject.grade}` : "Không xác định"}
                      </SubjectGrade>
                      <ButtonGroup>
                        <ButtonAction
                          className="view"
                          onClick={() => navigate(`/subjects/${subject.id}`)}
                          theme={theme}
                        >
                          Xem
                        </ButtonAction>
                        <ButtonAction
                          className="edit"
                          onClick={() => navigate(`/subject/edit/${subject.id}`)}
                          theme={theme}
                        >
                          Sửa
                        </ButtonAction>
                      </ButtonGroup>
                    </SubjectFooter>
                  </SubjectCard>
                ))}
              </SubjectsGrid>
              
              {/* Phân trang */}
              {totalFilteredPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalFilteredPages}
                  onPageChange={handlePageChange}
                  theme={theme}
                />
              )}
            </>
          ) : (
            <EmptyState theme={theme}>
              <EmptyTitle theme={theme}>Không tìm thấy môn học</EmptyTitle>
              <EmptyDescription theme={theme}>
                {filters.search || filters.grade !== "all"
                  ? "Không có môn học nào phù hợp với tiêu chí tìm kiếm của bạn."
                  : "Chưa có môn học nào được tạo. Hãy tạo môn học mới để bắt đầu."}
              </EmptyDescription>
              <ActionButtons>
                <HomeButton onClick={() => navigate("/")} theme={theme}>
                  <FaHome /> Quay về trang chủ
                </HomeButton>
                <CreateButton
                  onClick={() => navigate("/subject/create")}
                  theme={theme}
                >
                  <FaPlus /> Tạo môn học mới
                </CreateButton>
                {(filters.search || filters.grade !== "all") && (
                  <ClearFiltersButton
                    onClick={handleClearFilters}
                    theme={theme}
                  >
                    <FaFilter /> Xóa bộ lọc
                  </ClearFiltersButton>
                )}
              </ActionButtons>
            </EmptyState>
          )}
  
          {/* Refresh button */}
          <RefreshButton onClick={refreshData} theme={theme}>
            <FaRedo />
          </RefreshButton>
        </ContentContainer>
  
        <Footer />
      </PageContainer>
    );
  };
  
  export default SubjectsPage;