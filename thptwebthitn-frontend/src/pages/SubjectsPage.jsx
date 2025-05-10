import React, { useState, useEffect } from "react"; // Loại bỏ useCallback không dùng đến
import { useSelector } from "react-redux"; // Loại bỏ useDispatch không dùng đến
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Button } from "react-bootstrap"; // Add this import
import {
  FaPlus,
  FaSearch,
  FaHome,
  FaFilter,
  FaRedo,
  FaFileAlt, // Thêm biểu tượng này
  FaUserShield,
  FaArrowLeft,
  FaTrophy, // Thêm biểu tượng này
  // Thêm các icon cho các nút
  FaEye,
  FaEdit,
  FaTrash,
  FaBook
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import ExamReminderBanner from '../components/reminders/ExamReminderBanner';
import useExamReminders from '../hooks/useExamReminders';

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

// Thay đổi ButtonGroup để cải thiện bố cục
const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
`;

// Tạo LabeledButton mới thay thế ButtonAction cũ
const LabeledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  svg {
    margin-right: 0.4rem;
    font-size: 0.9rem;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &.view {
    background-color: #4285f4;
    color: white;
    &:hover { background-color: #3367d6; }
  }

  &.exam {
    background-color: #38b2ac;
    color: white;
    &:hover { background-color: #2c7a7b; }
  }

  &.edit {
    background-color: #f6ad55;
    color: white;
    &:hover { background-color: #dd6b20; }
  }

  &.delete {
    background-color: #f56565;
    color: white;
    &:hover { background-color: #e53e3e; }
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
  const currentTime = new Date().toLocaleTimeString("vi-VN");
  const user = useSelector(state => state.auth.user);
  const currentUser = user?.username;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const formatRole = (role) => {
    if (!role) return 'Học sinh';
    
    switch(role.toLowerCase()) {
      case 'admin':
        return 'Admin';
      case 'teacher':
        return 'Giáo viên';
      default:
        return 'Học sinh';
    }
  };
  // Debug function để xem dữ liệu và bộ lọc
  const debugInfo = () => {
    console.log("Current filters:", filters);
    console.log("Total subjects:", subjects.length);
    if (subjects.length > 0) {
      console.log("Sample subjects:", subjects.slice(0, 3));
    }
  };

  // Chức năng tải lại dữ liệu
  const refreshData = async () => {
    setLoading(true);
    setError("");
    await getSubjects();
  };

  // Lấy tất cả môn học từ API
  const getAllSubjects = async () => {
    try {
      const response = await fetch("http://localhost:5006/api/Subject/all");
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw API data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw error;
    }
  };

  // Hàm để trích xuất lớp từ mã môn học
  const extractGradeFromCode = (code) => {
    if (!code) return null;
    
    // Tìm số ở cuối mã môn học
    const match = code.match(/(\d+)$/);
    if (match && ["10", "11", "12"].includes(match[1])) {
      return match[1];
    }
    
    return null;
  };

  // Hàm để trích xuất lớp từ tên môn học
  const extractGradeFromName = (name) => {
    if (!name) return null;
    
    // Tìm số "10", "11", hoặc "12" trong tên
    const match = name.match(/(^|\s)(10|11|12)(\s|$)/);
    if (match) {
      return match[2];
    }
    
    return null;
  };

  // Load subjects
  const getSubjects = async () => {
    try {
      setLoading(true);
      console.log(`[${currentTime}] Fetching subjects...`);

      const data = await getAllSubjects();
      
      // Xác định cấu trúc dữ liệu
      let subjectsData = [];
      
      if (Array.isArray(data)) {
        subjectsData = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        subjectsData = data.data;
      } else {
        // Kiểm tra các thuộc tính khác
        for (const key in data) {
          if (Array.isArray(data[key])) {
            subjectsData = data[key];
            break;
          }
        }
      }
      
      if (subjectsData && subjectsData.length > 0) {
        // Xử lý dữ liệu môn học
        const processedSubjects = subjectsData.map(subject => {
          // Phân tích để lấy grade từ code hoặc tên nếu không có sẵn
          let grade = subject.grade;
          
          // Nếu không có grade hoặc grade là null, thử lấy từ code hoặc tên
          if (!grade || grade === null || grade === "null" || grade === "") {
            const gradeFromCode = extractGradeFromCode(subject.code);
            const gradeFromName = extractGradeFromName(subject.name);
            
            grade = gradeFromCode || gradeFromName;
          }
          
          // Đảm bảo grade là string để so sánh
          grade = grade !== null && grade !== undefined ? String(grade) : null;
          
          return {
            ...subject,
            grade: grade
          };
        });
        
        setSubjects(processedSubjects);
        console.log(`Loaded ${processedSubjects.length} subjects with processed grades`);
        
        // Log các mẫu môn học để debug
        if (processedSubjects.length > 0) {
          console.log("Sample processed subjects:");
          processedSubjects.slice(0, 5).forEach((subject, i) => {
            console.log(`${i+1}. ${subject.name} (${subject.code}): grade = ${subject.grade}`);
          });
        }
        
        setApiConnected(true);
      } else {
        setError("Không thể tìm thấy dữ liệu môn học từ API");
        setSubjects([]);
      }
    } catch (error) {
      console.error(`Error fetching subjects:`, error);
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

    // Fetch subjects
    getSubjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  useEffect(() => {
    // Debug khi filters hoặc subjects thay đổi
    debugInfo();
  }, [filters, subjects]);

  const subjectImageMap = {
    'Toán': MathImg,
    'Vật Lý': PhysicsImg,
    'Hóa Học': ChemistryImg,
    'Sinh Học': BiologyImg,
    'Ngữ Văn': LiteratureImg,
    'Tiếng Anh': EnglishImg,
    'Lịch Sử': HistoryImg,
    'Địa Lý': GeographyImg,
    'GDKT&PL': CivicEdu
  };
  
  // Hàm lấy ảnh cho môn học
  const getSubjectImage = (subject) => {
    // Nếu môn học đã có ảnh, sử dụng nó
    if (subject.img || subject.image) {
      return subject.img || subject.image;
    }
    
    // Kiểm tra tên môn học để lấy ảnh phù hợp
    for (const [key, image] of Object.entries(subjectImageMap)) {
      if (subject.name && subject.name.includes(key)) {
        return image;
      }
    }
    
    return 'https://th.bing.com/th/id/R.2e5199e2fc082abc56808506b3160abb?rik=Cl5LtOqm9qt7Kg&pid=ImgRaw&r=0';
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Filter changing: ${name} = ${value}`);
    
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Reset to first page when filters change
    setCurrentPage(1);
  };
  const hasEditAccess = () => {
    if (!user || !user.role) return false;
    const role = user.role.toLowerCase();
    return role === 'admin' || role === 'teacher';
  };
  
  const handleClearFilters = () => {
    setFilters({ search: "", grade: "all", sortBy: "name" });
    setCurrentPage(1);
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Filter subjects based on current filters
  const filteredSubjects = subjects
    .filter((subject) => {
      // Log detailed debug info for specific subjects
      const debugSubject = false;  // Set to true for detailed debugging
      
      if (debugSubject && subject.name.includes("Địa Lý")) {
        console.log(`Checking subject: ${subject.name} (${subject.code})`);
        console.log(`  Grade: ${subject.grade}, Filter: ${filters.grade}`);
      }
      
      // Filter by search query
      if (
        filters.search &&
        !subject.name?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !subject.code?.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Filter by grade if applicable
      if (filters.grade !== "all") {
        // Đảm bảo so sánh string với string
        const subjectGrade = subject.grade ? String(subject.grade) : null;
        
        if (debugSubject && subject.name.includes("Địa Lý")) {
          console.log(`  Subject ${subject.name} (${subject.code})`);
          console.log(`  Subject grade: "${subjectGrade}" (${typeof subjectGrade})`);
          console.log(`  Filter grade: "${filters.grade}" (${typeof filters.grade})`);
          console.log(`  Match: ${subjectGrade === filters.grade}`);
        }
        
        if (subjectGrade !== filters.grade) {
          return false;
        }
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
  
  // Hàm hiển thị lớp học của môn
  const displayGrade = (subject) => {
    if (!subject.grade) return "Tất cả các lớp";
    return `Lớp ${subject.grade}`;
  };
  const GradeBadge = styled.div`
    position: absolute;
    left: 0;
    top: 20px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 0 4px 4px 0;
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 2;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  `;
  const { upcomingExams, dismissExam } = useExamReminders(7); // Hiển thị nhắc nhở trước 7 ngày
  
  // Hàm xóa môn học cần được thêm vào component SubjectsPage
  const deleteSubject = async (subjectId) => {
    try {
      setLoading(true);
      console.log(`Đang xóa môn học ID: ${subjectId}`);
      
      // Gọi API để xóa môn học
      const response = await fetch(`http://localhost:5006/api/Subject/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Nếu cần xác thực
        }
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      }
      
      // Cập nhật danh sách môn học sau khi xóa
      setSubjects(subjects.filter(subject => subject.id !== subjectId));
      toast.success('Xóa môn học thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa môn học:', error);
      toast.error('Không thể xóa môn học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer theme={theme}>
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <ContentContainer>
        {/* Hiển thị banner nhắc nhở nếu có kỳ thi sắp diễn ra */}
        {upcomingExams.length > 0 && (
          <ExamReminderBanner 
            exam={upcomingExams[0]} 
            theme={theme}
            onClose={dismissExam}
          />
        )}
        
       
        <PageTitle theme={theme}>Danh sách môn học</PageTitle>
        <UserInfo theme={theme}>
        <span>{formatRole(user?.role)}</span>
        <span>
          Truy cập vào: lúc {currentTime} | Người dùng: {currentUser}
        </span>
        </UserInfo>

        <SubjectNavigation theme={theme} showOnlyCreateButton={hasEditAccess()} />

        <FiltersContainer theme={theme}>
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
                    {subject.grade && (
                      <GradeBadge>
                      Lớp {subject.grade}
                      </GradeBadge>
                    )}
                  </SubjectImageContainer>
                  
                  <SubjectHeader>
                    <SubjectTitle theme={theme}>{subject.name}</SubjectTitle>
                    <SubjectCode theme={theme}>{subject.code}</SubjectCode>
                  </SubjectHeader>

                  <SubjectDescription theme={theme}>
                    {subject.description || "Không có mô tả"}
                  </SubjectDescription>
                  
                  <SubjectFooter>
                    <ButtonGroup>
                      <LabeledButton
                        className="view"
                        onClick={() => navigate(`/subjects/${subject.id}`)}
                        theme={theme}
                      >
                        <FaEye /> Chi tiết
                      </LabeledButton>
                      
                      <LabeledButton
                        className="exam"
                        onClick={() => navigate(`/exams/by-subject/${subject.id}`)}
                        theme={theme}
                      >
                        <FaFileAlt /> Đề thi
                      </LabeledButton>
                      
                      {hasEditAccess() && (
                        <>
                          <LabeledButton
                            className="edit"
                            onClick={() => navigate(`/subject/edit/${subject.id}`)}
                            theme={theme}
                          >
                            <FaEdit /> Sửa
                          </LabeledButton>
                          
                          <LabeledButton
                            className="delete"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa môn học "${subject.name}" không?`)) {
                                deleteSubject(subject.id);
                              }
                            }}
                            theme={theme}
                          >
                            <FaTrash /> Xóa
                          </LabeledButton>
                        </>
                      )}
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
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <HomeButton onClick={() => navigate("/")} theme={theme}>
                <FaHome /> Quay về trang chủ
              </HomeButton>
              {hasEditAccess() && (
              <CreateButton
                onClick={() => navigate("/subject/create")}
                theme={theme}
              >
                <FaPlus /> Tạo môn học mới
              </CreateButton>
              )}
              {(filters.search || filters.grade !== "all") && (
                <ClearFiltersButton
                  onClick={handleClearFilters}
                  theme={theme}
                >
                  <FaFilter /> Xóa bộ lọc
                </ClearFiltersButton>
              )}
            </div>
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