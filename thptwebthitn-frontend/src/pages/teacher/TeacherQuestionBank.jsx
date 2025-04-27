import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Table, Form, Badge, InputGroup, Dropdown, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFileExcel, FaFileImport, FaSearch, FaFilter, FaEye, FaDownload, FaBug } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import Pagination from '../../components/common/Pagination';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import styled from 'styled-components';
import DOMPurify from 'dompurify';

// Styled components (không thay đổi)
const FilterSection = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f8f9fa'};
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FilterBadge = styled(Badge)`
  margin-right: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 0.85rem;
`;

const DifficultyBadge = styled(Badge)`
  font-size: 0.8rem;
  padding: 0.35rem 0.65rem;
`;

const ActionButton = styled(Button)`
  margin-right: 0.5rem;
`;

const DebugBox = styled.pre`
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-size: 12px;
  max-height: 150px;
  overflow: auto;
  margin: 10px 0;
`;

// Helper functions
const truncateText = (text, maxLength) => {
  if (!text) return '';
  const stripped = text.replace(/<[^>]*>/g, '');
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength) + '...';
};

const getDifficultyVariant = (difficulty) => {
  // Xử lý trường hợp levelId dạng số
  if (typeof difficulty === 'number') {
    switch(difficulty) {
      case 1: return 'success'; // Dễ
      case 2: return 'warning'; // Trung bình
      case 3: return 'danger';  // Khó
      default: return 'secondary';
    }
  }
  
  // Xử lý trường hợp difficulty dạng chuỗi
  switch(String(difficulty).toLowerCase()) {
    case 'easy': return 'success';
    case 'medium': return 'warning';
    case 'hard': return 'danger';
    default: return 'secondary';
  }
};

const getDifficultyText = (difficulty) => {
  // Xử lý trường hợp levelId dạng số
  if (typeof difficulty === 'number') {
    switch(difficulty) {
      case 1: return 'Dễ';
      case 2: return 'Trung bình';
      case 3: return 'Khó';
      default: return 'Không xác định';
    }
  }
  
  // Xử lý trường hợp difficulty dạng chuỗi
  switch(String(difficulty).toLowerCase()) {
    case 'easy': return 'Dễ';
    case 'medium': return 'Trung bình';
    case 'hard': return 'Khó';
    default: return 'Không xác định';
  }
};

const TeacherQuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const { theme } = useSelector(state => state.ui);
  const navigate = useNavigate();
  const [showDebug, setShowDebug] = useState(false); // Thêm state debug

  // Filter states
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);

  // Question deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // API response debug state
  const [apiResponses, setApiResponses] = useState({
    subjects: null,
    chapters: null,
    questions: null
  });

  // Helper functions for getting subject and chapter names
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'Không xác định';
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    return subject?.name || `ID: ${subjectId}`;
  };

  const getChapterName = (chapterId) => {
    if (!chapterId) return 'Không xác định';
    const chapter = chapters.find(c => c.id === parseInt(chapterId));
    return chapter?.name || `ID: ${chapterId}`;
  };

  // Khởi tạo Axios với interceptor để ghi log
  useEffect(() => {
    // Interceptor để log tất cả requests
    axios.interceptors.request.use(
      config => {
        console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config);
        return config;
      },
      error => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Interceptor để log tất cả responses
    axios.interceptors.response.use(
      response => {
        console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, response);
        return response;
      },
      error => {
        console.error(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
        return Promise.reject(error);
      }
    );
    
    // Tải dữ liệu ban đầu
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, searchTerm, selectedSubject, selectedChapter, selectedDifficulty]);

  // Fetch subjects for filter
  const fetchSubjects = async () => {
    try {
      console.log('Đang tải danh sách môn học...');
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      
      // Thử gọi 3 endpoints khác nhau để xem endpoint nào hoạt động
      const endpoints = [
        `${API_URL}/api/Subject/all`
      ];
      
      let response = null;
      for (const endpoint of endpoints) {
        try {
          console.log(`Thử endpoint: ${endpoint}`);
          
          response = await axios.get(endpoint, {
            headers: token ? { 
              'Authorization': `Bearer ${token}`
            } : {}
          });
          
          if (response.data) {
            console.log(`Endpoint ${endpoint} thành công:`, response.data);
            break; // Thoát vòng lặp nếu API call thành công
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} lỗi:`, err.message);
          // Tiếp tục thử endpoint khác
        }
      }
      
      if (!response) {
        throw new Error('Không thể kết nối đến API môn học');
      }
      
      setApiResponses(prev => ({ ...prev, subjects: response.data }));
      
      // Xử lý response data - thử nhiều cấu trúc khác nhau
      let subjectsArray;
      
      if (Array.isArray(response.data)) {
        console.log('Subject data là mảng trực tiếp');
        subjectsArray = response.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        console.log('Subject data có thuộc tính items là mảng');
        subjectsArray = response.data.items;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('Subject data có thuộc tính data là mảng');
        subjectsArray = response.data.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        console.log('Subject data là một object, chuyển thành mảng');
        subjectsArray = [response.data];
      } else {
        console.log('Subject data không phải mảng hoặc null/undefined');
        subjectsArray = [];
      }
      
      console.log('Mảng môn học sau khi xử lý:', subjectsArray);
      setSubjects(subjectsArray);
    } catch (err) {
      console.error('Lỗi tải môn học:', err);
      setError(`Không thể tải danh sách môn học: ${err.message}`);
      setSubjects([]);
    }
  };

  // Fetch chapters when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchChapters(selectedSubject);
    } else {
      setChapters([]);
    }
  }, [selectedSubject]);

  const fetchChapters = async (subjectId) => {
    try {
      console.log(`Đang tải danh sách chương cho môn học ID=${subjectId}...`);
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      
      // Thử nhiều cách gọi API khác nhau
      const endpoints = [
        {
          url: `${API_URL}/api/Chapter`,
          params: { subjectId }
        },
        {
          url: `${API_URL}/api/Chapters`,
          params: { subjectId }
        },
        {
          url: `${API_URL}/api/Chapter/subject/${subjectId}`,
          params: {}
        }
      ];
      
      let response = null;
      for (const endpoint of endpoints) {
        try {
          console.log(`Thử endpoint: ${endpoint.url} với params:`, endpoint.params);
          
          response = await axios.get(endpoint.url, {
            headers: token ? { 
              'Authorization': `Bearer ${token}`
            } : {},
            params: endpoint.params
          });
          
          if (response.data) {
            console.log(`Endpoint ${endpoint.url} thành công:`, response.data);
            break; // Thoát vòng lặp nếu API call thành công
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint.url} lỗi:`, err.message);
          // Tiếp tục thử endpoint khác
        }
      }
      
      if (!response) {
        throw new Error(`Không thể tải danh sách chương cho môn học ID=${subjectId}`);
      }
      
      setApiResponses(prev => ({ ...prev, chapters: response.data }));
      
      // Xử lý response data - thử nhiều cấu trúc khác nhau
      let chaptersArray;
      
      if (Array.isArray(response.data)) {
        console.log('Chapter data là mảng trực tiếp');
        chaptersArray = response.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        console.log('Chapter data có thuộc tính items là mảng');
        chaptersArray = response.data.items;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('Chapter data có thuộc tính data là mảng');
        chaptersArray = response.data.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        console.log('Chapter data là một object, chuyển thành mảng');
        chaptersArray = [response.data];
      } else {
        console.log('Chapter data không phải mảng hoặc null/undefined');
        chaptersArray = [];
      }
      
      // Filter chapters by the selected subject
      if (subjectId) {
        chaptersArray = chaptersArray.filter(chapter => 
          String(chapter.subjectId) === String(subjectId)
        );
      }
      
      console.log('Mảng chương sau khi xử lý:', chaptersArray);
      setChapters(chaptersArray);
    } catch (err) {
      console.error('Lỗi tải chương:', err);
      setError(`Không thể tải danh sách chương: ${err.message}`);
      setChapters([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      console.log('Đang tải câu hỏi với tham số:',
        { page: currentPage, pageSize, searchTerm, subjectId: selectedSubject, chapterId: selectedChapter, difficulty: selectedDifficulty }
      );
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = {
        page: currentPage,
        pageSize
      };
      
      // Xử lý tham số search/searchTerm (thử cả hai)
      if (searchTerm) {
        params.search = searchTerm; // Thử với tên tham số 'search'
        params.searchTerm = searchTerm; // Thử với tên tham số 'searchTerm'
      }
      
      if (selectedSubject) {
        params.subjectId = parseInt(selectedSubject);
      }
      
      if (selectedChapter) {
        params.chapterId = parseInt(selectedChapter);
      }
      
      if (selectedDifficulty) {
        // Map string difficulty to numeric levelId
        let levelId;
        switch(selectedDifficulty.toLowerCase()) {
          case 'easy': levelId = 1; break;
          case 'medium': levelId = 2; break;
          case 'hard': levelId = 3; break;
          default: break;
        }
        
        if (levelId) {
          params.levelId = levelId; // Thử với tên tham số 'levelId'
          params.difficulty = selectedDifficulty; // Thử với tên tham số 'difficulty'
        }
      }
      
      console.log('Gọi API câu hỏi với params:', params);
      
      // Thử nhiều cách gọi API khác nhau
      const endpoints = [
        `${API_URL}/api/Question`,
        `${API_URL}/api/Questions`,
        `${API_URL}/api/Question/all`
      ];
      
      let response = null;
      for (const endpoint of endpoints) {
        try {
          console.log(`Thử endpoint: ${endpoint}`);
          
          response = await axios.get(endpoint, {
            headers: token ? { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } : {},
            params
          });
          
          if (response.data) {
            console.log(`Endpoint ${endpoint} thành công:`, response.data);
            break; // Thoát vòng lặp nếu API call thành công
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} lỗi:`, err.message);
          // Tiếp tục thử endpoint khác
        }
      }
      
      if (!response) {
        throw new Error('Không thể kết nối đến API câu hỏi');
      }
      
      setApiResponses(prev => ({ ...prev, questions: response.data }));
      
      // Xử lý response data - thử nhiều cấu trúc khác nhau
      let questionsArray;
      let totalPagesCount = 1;
      
      if (Array.isArray(response.data)) {
        console.log('Question data là mảng trực tiếp');
        questionsArray = response.data;
        totalPagesCount = Math.ceil(response.data.length / pageSize) || 1;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        console.log('Question data có thuộc tính items là mảng');
        questionsArray = response.data.items;
        totalPagesCount = response.data.totalPages || Math.ceil(questionsArray.length / pageSize) || 1;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('Question data có thuộc tính data là mảng');
        questionsArray = response.data.data;
        totalPagesCount = response.data.totalPages || Math.ceil(questionsArray.length / pageSize) || 1;
      } else if (typeof response.data === 'object' && response.data !== null) {
        console.log('Question data là một object, chuyển thành mảng');
        questionsArray = [response.data];
        totalPagesCount = 1;
      } else {
        console.log('Question data không phải mảng hoặc null/undefined');
        questionsArray = [];
        totalPagesCount = 0;
      }
      
      console.log('Mảng câu hỏi sau khi xử lý:', questionsArray);
      
      if (questionsArray.length > 0) {
        console.log('Ví dụ câu hỏi đầu tiên:', questionsArray[0]);
      }
      
      // Làm giàu thông tin câu hỏi với dữ liệu môn học và chương
      const enhancedQuestions = questionsArray.map(question => ({
        ...question,
        // Nếu câu hỏi không có object subject nhưng có subjectId, gán subject object
        subject: question.subject || (question.subjectId ? { 
          id: question.subjectId,
          name: getSubjectName(question.subjectId) 
        } : null),
        
        // Nếu câu hỏi không có object chapter nhưng có chapterId, gán chapter object
        chapter: question.chapter || (question.chapterId ? {
          id: question.chapterId,
          name: getChapterName(question.chapterId)
        } : null),
        
        // Đảm bảo có trường difficulty hoặc levelId
        difficulty: question.difficulty || 
                   (question.levelId === 1 ? 'easy' : 
                    question.levelId === 2 ? 'medium' : 
                    question.levelId === 3 ? 'hard' : 'medium')
      }));
      
      console.log('Câu hỏi sau khi làm giàu dữ liệu:', enhancedQuestions);
      
      setQuestions(enhancedQuestions);
      setTotalPages(totalPagesCount);
      setError(null);
    } catch (err) {
      console.error('Lỗi tải câu hỏi:', err);
      setError(`Không thể tải danh sách câu hỏi: ${err.message}`);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      
      // Chuẩn bị request body xuất Excel
      const exportRequest = {
        subjectId: selectedSubject ? parseInt(selectedSubject) : 0,
        chapterId: selectedChapter ? parseInt(selectedChapter) : 0,
        search: searchTerm || '',
        includeOptions: true,
        includeExplanation: true,
        includeMetadata: true,
        format: 'xlsx'
      };

      console.log('Xuất Excel với request:', exportRequest);

      // Gọi trực tiếp API xuất Excel
      const response = await axios.post(
        `${API_URL}/api/Question/export`, 
        exportRequest, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );
      
      // Tạo URL cho blob và kích hoạt tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ngan-hang-cau-hoi.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccessToast('Xuất Excel thành công!');
    } catch (err) {
      console.error('Lỗi xuất Excel:', err);
      showErrorToast('Không thể xuất file Excel. Vui lòng thử lại sau.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      
      // Gọi trực tiếp API tải mẫu
      const response = await axios.get(
        `${API_URL}/api/Question/import-template`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );
      
      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mau-nhap-cau-hoi.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccessToast('Tải mẫu nhập câu hỏi thành công!');
    } catch (err) {
      console.error('Lỗi tải mẫu:', err);
      showErrorToast('Không thể tải mẫu nhập câu hỏi. Vui lòng thử lại sau.');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
    setSelectedChapter(''); // Reset chapter when subject changes
    setCurrentPage(1);
  };

  const handleChapterChange = (e) => {
    setSelectedChapter(e.target.value);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
    setCurrentPage(1);
  };

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setCurrentPage(1);
  };

  // Cập nhật hàm clearFilters
  const clearFilters = () => {
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedDifficulty('');
    setSelectedTopic(''); // Thêm dòng này
    setSearchTerm('');
    setCurrentPage(1);
  };

  const confirmDelete = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      
      // Gọi trực tiếp API xóa câu hỏi
      await axios.delete(
        `${API_URL}/api/Question/${questionToDelete.id}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setShowDeleteModal(false);
      showSuccessToast('Câu hỏi đã được xóa thành công!');
      fetchQuestions(); // Refresh question list
    } catch (err) {
      showErrorToast('Không thể xóa câu hỏi. Vui lòng thử lại.');
      console.error('Lỗi xóa câu hỏi:', err);
    }
  };

  // Render HTML content safely
  const renderHTML = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Ngân hàng câu hỏi</h2>
      
      {/* Debug buttons - chỉ hiển thị trong môi trường development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-3">
          <Button 
            variant="secondary" 
            size="sm"
            className="me-2"
            onClick={() => setShowDebug(!showDebug)}
          >
            <FaBug /> {showDebug ? 'Ẩn Debug' : 'Hiện Debug'}
          </Button>
          
          <Button 
            variant="info" 
            size="sm"
            className="me-2"
            onClick={() => {
              console.log('Subjects:', subjects);
              console.log('Chapters:', chapters);
              console.log('Questions:', questions);
              alert('Đã ghi log dữ liệu, mở Console để xem');
            }}
          >
            Log Dữ Liệu
          </Button>
          
          <Button 
            variant="warning" 
            size="sm"
            onClick={() => {
              fetchSubjects();
              fetchQuestions();
              alert('Đang tải lại dữ liệu...');
            }}
          >
            Tải lại
          </Button>
        </div>
      )}
      
      {/* Debug information */}
      {showDebug && (
        <div className="mb-3">
          <h5>Debug Info</h5>
          <div className="row">
            <div className="col-md-4">
              <h6>Subjects API Response:</h6>
              <DebugBox>
                {JSON.stringify(apiResponses.subjects, null, 2)}
              </DebugBox>
            </div>
            <div className="col-md-4">
              <h6>Chapters API Response:</h6>
              <DebugBox>
                {JSON.stringify(apiResponses.chapters, null, 2)}
              </DebugBox>
            </div>
            <div className="col-md-4">
              <h6>Questions API Response:</h6>
              <DebugBox>
                {JSON.stringify(apiResponses.questions, null, 2)}
              </DebugBox>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6">
              <h6>Processed Data:</h6>
              <div className="d-flex">
                <div className="me-3">
                  <strong>Subjects:</strong> {subjects.length}<br />
                  <strong>Chapters:</strong> {chapters.length}<br />
                  <strong>Questions:</strong> {questions.length}
                </div>
                <div>
                  <strong>Selected Subject:</strong> {selectedSubject || 'None'}<br />
                  <strong>Selected Chapter:</strong> {selectedChapter || 'None'}<br />
                  <strong>Selected Difficulty:</strong> {selectedDifficulty || 'None'}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <h6>Example Data:</h6>
              <DebugBox>
                {subjects.length > 0 && `Subject Example: ${JSON.stringify(subjects[0], null, 2)}`}
                {questions.length > 0 && `\nQuestion Example: ${JSON.stringify(questions[0], null, 2)}`}
              </DebugBox>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-3">
          <strong>Lỗi:</strong> {error}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="d-flex">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={theme === 'dark' ? 'bg-dark text-white border-dark' : ''}
              />
              <Button variant="primary" onClick={() => fetchQuestions()}>
                <FaSearch />
              </Button>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex justify-content-end">
          <Link to="/teacher/questions/create">
            <Button variant="success" className="me-2">
              <FaPlus /> Thêm câu hỏi
            </Button>
          </Link>
          <Dropdown className="me-2">
            <Dropdown.Toggle variant="info" id="dropdown-import">
              <FaFileImport /> Nhập / Xuất
            </Dropdown.Toggle>
            <Dropdown.Menu className={theme === 'dark' ? 'bg-dark text-white' : ''}>
              <Dropdown.Item 
                as={Link} 
                to="/teacher/questions/import"
                className={theme === 'dark' ? 'text-white' : ''}
              >
                <FaFileImport className="me-2" /> Nhập từ Excel
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={handleDownloadTemplate}
                className={theme === 'dark' ? 'text-white' : ''}
              >
                <FaDownload className="me-2" /> Tải mẫu nhập liệu
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={handleExportExcel}
                disabled={exportLoading}
                className={theme === 'dark' ? 'text-white' : ''}
              >
                {exportLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <FaFileExcel className="me-2" /> Xuất ra Excel
                  </>
                )}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      
      <FilterSection theme={theme}>
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Môn học ({subjects.length})</Form.Label>
              <Form.Select 
                value={selectedSubject} 
                onChange={handleSubjectChange}
                className={theme === 'dark' ? 'bg-dark text-white border-dark' : ''}
              >
                <option value="">Tất cả môn học</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name || `ID: ${subject.id}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Chương ({chapters.length})</Form.Label>
              <Form.Select 
                value={selectedChapter} 
                onChange={handleChapterChange}
                disabled={!selectedSubject}
                className={theme === 'dark' ? 'bg-dark text-white border-dark' : ''}
              >
                <option value="">Tất cả chương</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name || `ID: ${chapter.id}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Độ khó</Form.Label>
              <Form.Select 
                value={selectedDifficulty} 
                onChange={handleDifficultyChange}
                className={theme === 'dark' ? 'bg-dark text-white border-dark' : ''}
              >
                <option value="">Tất cả độ khó</option>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <Button variant="outline-secondary" onClick={clearFilters} className="mb-3">
              <FaFilter className="me-1" /> Xóa bộ lọc
            </Button>
          </Col>
        </Row>
        
        {/* Hiển thị bộ lọc đang áp dụng */}
        {(selectedSubject || selectedChapter || selectedDifficulty) && (
          <div className="mt-2">
            <small>Bộ lọc đang áp dụng:</small><br/>
            {selectedSubject && (
              <FilterBadge bg="primary">
                Môn học: {getSubjectName(selectedSubject)}
                <span className="ms-1" onClick={() => setSelectedSubject('')} style={{cursor: 'pointer'}}>×</span>
              </FilterBadge>
            )}
            {selectedChapter && (
              <FilterBadge bg="info">
                Chương: {getChapterName(selectedChapter)}
                <span className="ms-1" onClick={() => setSelectedChapter('')} style={{cursor: 'pointer'}}>×</span>
              </FilterBadge>
            )}
            {selectedDifficulty && (
              <FilterBadge bg={getDifficultyVariant(selectedDifficulty)}>
                Độ khó: {getDifficultyText(selectedDifficulty)}
                <span className="ms-1" onClick={() => setSelectedDifficulty('')} style={{cursor: 'pointer'}}>×</span>
              </FilterBadge>
            )}
          </div>
        )}
      </FilterSection>

      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Body>
          {/* Hiển thị thông tin về số lượng câu hỏi */}
          <div className="mb-3">
            <small>Tổng số câu hỏi: {questions.length} | Trang: {currentPage}/{totalPages}</small>
          </div>
          
          {loading && questions.length === 0 ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
                <thead>
                  <tr>
                    <th style={{width: '5%'}}>#</th>
                    <th style={{width: '35%'}}>Nội dung câu hỏi</th>
                    <th style={{width: '15%'}}>Môn học</th>
                    <th style={{width: '15%'}}>Chương</th>
                    <th style={{width: '10%'}}>Độ khó</th>
                    <th style={{width: '20%'}}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length > 0 ? (
                    questions.map((question, index) => (
                      <tr key={question.id || index}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>
                          <div 
                            className="question-content" 
                            dangerouslySetInnerHTML={renderHTML(question.content || 'Không có nội dung')} 
                          />
                        </td>
                        <td>
                          {question.subject?.name || 
                           getSubjectName(question.subjectId) || 
                           `ID: ${question.subjectId || 'N/A'}`}
                        </td>
                        <td>
                          {question.chapter?.name || 
                           getChapterName(question.chapterId) || 
                           `ID: ${question.chapterId || 'N/A'}`}
                        </td>
                        <td>
                          <DifficultyBadge bg={getDifficultyVariant(question.levelId || question.difficulty)}>
                            {getDifficultyText(question.levelId || question.difficulty)}
                          </DifficultyBadge>
                        </td>
                        <td>
                          <ActionButton variant="info" size="sm" title="Xem chi tiết"
                            onClick={() => navigate(`/teacher/questions/${question.id}`)}>
                            <FaEye />
                          </ActionButton>
                          <ActionButton variant="primary" size="sm" title="Chỉnh sửa"
                            onClick={() => navigate(`/teacher/questions/${question.id}/edit`)}>
                            <FaEdit />
                          </ActionButton>
                          <ActionButton 
                            variant="danger" 
                            size="sm" 
                            title="Xóa câu hỏi"
                            onClick={() => confirmDelete(question)}
                          >
                            <FaTrash />
                          </ActionButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        {loading ? "Đang tải dữ liệu..." : "Không có câu hỏi nào"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xóa</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa câu hỏi này?</p>
                <div className="alert alert-warning">
                  Lưu ý: Việc xóa câu hỏi sẽ ảnh hưởng đến các đề thi đang sử dụng câu hỏi này.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Hủy</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default TeacherQuestionBank;