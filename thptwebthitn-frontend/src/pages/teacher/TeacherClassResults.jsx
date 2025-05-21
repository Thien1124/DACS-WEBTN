import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Badge, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaFilePdf, FaFileExcel, FaChartBar, FaFilter, FaSearch, FaDownload } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import styled from 'styled-components';
import { exportStudents, exportScores } from '../../services/studentService';
import {toast} from 'react-toastify';
const StyledContainer = styled(Container)`
  padding: 20px;
`;

const PageTitle = styled.h2`
  margin-bottom: 20px;
  color: ${props => props.theme === 'dark' ? '#fff' : '#333'};
`;

const FilterCard = styled(Card)`
  margin-bottom: 20px;
  background-color: ${props => props.theme === 'dark' ? '#2c2c2c' : '#f8f9fa'};
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatsCard = styled(Card)`
  margin-bottom: 20px;
  background-color: ${props => props.theme === 'dark' ? '#2c2c2c' : '#f8f9fa'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const StatValue = styled.h3`
  font-weight: bold;
  margin-bottom: 0;
  color: ${props => props.color || (props.theme === 'dark' ? '#fff' : '#333')};
`;

const StatLabel = styled.p`
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#ccc' : '#666'};
`;

const StyledTable = styled(Table)`
  &.table-dark {
    background-color: #343a40;
  }
  
  th {
    position: sticky;
    top: 0;
    background-color: ${props => props.theme === 'dark' ? '#343a40' : '#f8f9fa'};
    z-index: 1;
  }
`;

const ExportButton = styled(Button)`
  margin-right: 10px;
`;

const TeacherClassResults = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006';
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [classResults, setClassResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch classrooms taught by this teacher
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/classrooms`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let classroomData = [];
        if (response.data && Array.isArray(response.data)) {
          classroomData = response.data;
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          classroomData = response.data.items;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          classroomData = response.data.data;
        }
        
        setClassrooms(classroomData);
        setError(null);
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        setError('Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassrooms();
  }, [API_URL]);
  
  // Fetch class results when classroom is selected
  useEffect(() => {
    if (!selectedClassroom) return;
    
    const fetchClassResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const url = selectedExam 
          ? `${API_URL}/api/class-results/${selectedClassroom}?examId=${selectedExam}` 
          : `${API_URL}/api/class-results/${selectedClassroom}`;
        
        const response = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setClassResults(response.data);
        
        // Extract unique exams from the results
        if (response.data && response.data.exams) {
          setExams(response.data.exams.map(exam => ({
            id: exam.examId,
            title: exam.examTitle
          })));
        }
      } catch (err) {
        console.error('Error fetching class results:', err);
        if (err.response?.status === 404) {
          setError(`Không tìm thấy kết quả cho lớp ${selectedClassroom}`);
        } else {
          setError('Không thể tải kết quả lớp học. Vui lòng thử lại sau.');
        }
        setClassResults(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassResults();
  }, [API_URL, selectedClassroom, selectedExam]);
  
  const handleClassroomChange = (e) => {
    setSelectedClassroom(e.target.value);
    setSelectedExam(null);
    setActiveTab('overview');
  };
  
  const handleExamChange = (e) => {
    setSelectedExam(e.target.value === 'all' ? null : Number(e.target.value));
  };
  
  const handleExportExcel = async () => {
    if (!selectedClassroom) {
      showErrorToast('Vui lòng chọn lớp học trước khi xuất Excel');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = selectedExam 
        ? `${API_URL}/api/class-results/${selectedClassroom}/export/excel?examId=${selectedExam}` 
        : `${API_URL}/api/class-results/${selectedClassroom}/export/excel`;
      
      // Using fetch for file download instead of axios
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a link to download the file
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'ket-qua-lop.xlsx';
      
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
      
      showSuccessToast('Đã xuất kết quả ra file Excel thành công!');
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      showErrorToast('Có lỗi xảy ra khi xuất file Excel');
    }
  };
  const handleExportStudentsList = async () => {
  try {
    if (!selectedClassroom) {
      showErrorToast('Vui lòng chọn lớp học trước khi xuất danh sách học sinh');
      return;
    }
    
    // Start loading indicator
    const toastId = showSuccessToast("Đang xuất danh sách học sinh...", {
      autoClose: false,
      closeButton: false
    });
    
    // Call the export API
    const response = await exportStudents({ classroomName: selectedClassroom });
    
    // Create a URL for the downloaded file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get a filename from headers if available or create a default one
    const contentDisposition = response.headers['content-disposition'];
    let filename = `danh_sach_hoc_sinh_${selectedClassroom}.xlsx`;
    
    if (contentDisposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Update toast message
    toast.update(toastId, {
      render: "Xuất danh sách học sinh thành công!",
      type: "success",
      autoClose: 3000
    });
  } catch (error) {
    console.error('Lỗi khi xuất danh sách học sinh:', error);
    showErrorToast("Không thể xuất danh sách học sinh. Vui lòng thử lại sau.");
  }
};

const handleExportExamScores = async () => {
  try {
    if (!selectedExam) {
      showErrorToast("Vui lòng chọn một bài thi để xuất điểm");
      return;
    }
    
    // Start loading indicator
    const toastId = showSuccessToast("Đang xuất bảng điểm chi tiết...", {
      autoClose: false,
      closeButton: false
    });
    
    // Call the export API
    const response = await exportScores({ officialExamId: parseInt(selectedExam, 10) });
    
    // Create a URL for the downloaded file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get a filename from headers if available or create a default one
    const contentDisposition = response.headers['content-disposition'];
    let filename = `bang_diem_ky_thi_${selectedExam}.xlsx`;
    
    if (contentDisposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Update toast message
    toast.update(toastId, {
      render: "Xuất bảng điểm thành công!",
      type: "success",
      autoClose: 3000
    });
  } catch (error) {
    console.error('Lỗi khi xuất bảng điểm chi tiết:', error);
    showErrorToast("Không thể xuất bảng điểm chi tiết. Vui lòng thử lại sau.");
  }
};
  const handleExportPdf = async () => {
    if (!selectedClassroom) {
      showErrorToast('Vui lòng chọn lớp học trước khi xuất PDF');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = selectedExam 
        ? `${API_URL}/api/class-results/${selectedClassroom}/export/pdf?examId=${selectedExam}` 
        : `${API_URL}/api/class-results/${selectedClassroom}/export/pdf`;
      
      // Using fetch for file download instead of axios
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a link to download the file
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'ket-qua-lop.pdf';
      
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
      
      showSuccessToast('Đã xuất kết quả ra file PDF thành công!');
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      showErrorToast('Có lỗi xảy ra khi xuất file PDF');
    }
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    return `${minutes} phút`;
  };
  
  return (
    <StyledContainer>
      <PageTitle theme={theme}>Kết Quả Học Tập Theo Lớp</PageTitle>
      
      <FilterCard theme={theme}>
        <Card.Body>
          <Row>
            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Chọn Lớp:</Form.Label>
                <Form.Select 
                  value={selectedClassroom}
                  onChange={handleClassroomChange}
                  disabled={loading}
                >
                  <option value="">-- Chọn lớp học --</option>
                  {classrooms.map((classroom, index) => (
                    <option key={index} value={classroom.name || classroom}>
                      {classroom.name || classroom}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            {selectedClassroom && exams.length > 0 && (
              <Col md={6} lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Lọc theo bài thi:</Form.Label>
                  <Form.Select 
                    value={selectedExam || 'all'}
                    onChange={handleExamChange}
                    disabled={loading}
                  >
                    <option value="all">Tất cả bài thi</option>
                    {exams.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        {exam.title}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            
            {selectedClassroom && (
              <Col md={12} lg={4} className="d-flex align-items-end mb-3 flex-wrap">
                <ExportButton 
                  variant="success" 
                  onClick={handleExportExcel}
                  disabled={loading || !classResults}
                  className="me-2 mb-2"
                >
                  <FaFileExcel className="me-2" /> Xuất Excel
                </ExportButton>
                <ExportButton 
                  variant="danger" 
                  onClick={handleExportPdf}
                  disabled={loading || !classResults}
                  className="me-2 mb-2"
                >
                  <FaFilePdf className="me-2" /> Xuất PDF
                </ExportButton>
                <ExportButton 
                  variant="info" 
                  onClick={handleExportStudentsList}
                  disabled={loading}
                  className="me-2 mb-2"
                >
                  <FaDownload className="me-2" /> Xuất DS học sinh
                </ExportButton>
                {selectedExam && (
                  <ExportButton 
                    variant="warning" 
                    onClick={handleExportExamScores}
                    disabled={loading || !selectedExam}
                    className="mb-2"
                  >
                    <FaFileExcel className="me-2" /> Xuất bảng điểm
                  </ExportButton>
                )}
              </Col>
            )}
          </Row>
        </Card.Body>
      </FilterCard>
      
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      )}
      
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      {!loading && !error && classResults && (
        <>
          <Tabs 
            activeKey={activeTab} 
            onSelect={k => setActiveTab(k)} 
            className="mb-4"
            variant={theme === 'dark' ? 'dark' : 'tabs'}
          >
            <Tab eventKey="overview" title="Tổng quan">
              <Row>
                <Col lg={3} md={6} sm={12} className="mb-4">
                  <StatsCard theme={theme}>
                    <Card.Body className="text-center">
                      <StatValue theme={theme}>{classResults.totalStudents}</StatValue>
                      <StatLabel theme={theme}>Tổng số học sinh</StatLabel>
                    </Card.Body>
                  </StatsCard>
                </Col>
                <Col lg={3} md={6} sm={12} className="mb-4">
                  <StatsCard theme={theme}>
                    <Card.Body className="text-center">
                      <StatValue theme={theme}>{classResults.statistics?.totalExams || 0}</StatValue>
                      <StatLabel theme={theme}>Số bài thi</StatLabel>
                    </Card.Body>
                  </StatsCard>
                </Col>
                <Col lg={3} md={6} sm={12} className="mb-4">
                  <StatsCard theme={theme}>
                    <Card.Body className="text-center">
                      <StatValue theme={theme}>{classResults.statistics?.totalResults || 0}</StatValue>
                      <StatLabel theme={theme}>Tổng số lượt thi</StatLabel>
                    </Card.Body>
                  </StatsCard>
                </Col>
                <Col lg={3} md={6} sm={12} className="mb-4">
                  <StatsCard theme={theme}>
                    <Card.Body className="text-center">
                      <StatValue theme={theme} color="#28a745">
                        {classResults.statistics?.averageScore?.toFixed(2) || '0.00'}
                      </StatValue>
                      <StatLabel theme={theme}>Điểm trung bình</StatLabel>
                    </Card.Body>
                  </StatsCard>
                </Col>
              </Row>
              
              {classResults.statistics?.bestStudentName && (
                <Card className="mb-4" bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                  <Card.Body>
                    <Card.Title>Học sinh xuất sắc nhất</Card.Title>
                    <Card.Text>
                      <strong>{classResults.statistics.bestStudentName}</strong> đạt thành tích học tập tốt nhất lớp.
                    </Card.Text>
                  </Card.Body>
                </Card>
              )}
            </Tab>
            
            <Tab eventKey="details" title="Chi tiết bài thi">
              {classResults.exams && classResults.exams.length > 0 ? (
                classResults.exams.map(exam => (
                  <Card key={exam.examId} className="mb-4" bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                    <Card.Header>
                      <h5 className="mb-0">{exam.examTitle}</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row className="mb-3">
                        <Col md={3}>
                          <div className="d-flex flex-column">
                            <small className="text-muted">Điểm trung bình</small>
                            <h4>{exam.averageScore?.toFixed(2) || '0.00'}</h4>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="d-flex flex-column">
                            <small className="text-muted">Đạt</small>
                            <h4>{exam.passedCount} <small>({(exam.passedCount / (exam.totalStudents || 1) * 100).toFixed(1)}%)</small></h4>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="d-flex flex-column">
                            <small className="text-muted">Không đạt</small>
                            <h4>{exam.failedCount} <small>({(exam.failedCount / (exam.totalStudents || 1) * 100).toFixed(1)}%)</small></h4>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="d-flex flex-column">
                            <small className="text-muted">Tổng số học sinh</small>
                            <h4>{exam.totalStudents}</h4>
                          </div>
                        </Col>
                      </Row>
                      
                      <h5 className="mt-4 mb-3">Kết quả chi tiết</h5>
                      <div className="table-responsive">
                        <StyledTable striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Học sinh</th>
                              <th>Mã học sinh</th>
                              <th>Điểm số</th>
                              <th>Tỷ lệ</th>
                              <th>Trạng thái</th>
                              <th>Câu đúng</th>
                              <th>Tổng câu</th>
                              <th>Thời gian làm bài</th>
                            </tr>
                          </thead>
                          <tbody>
                            {exam.results.map((result, index) => (
                              <tr key={result.id}>
                                <td>{index + 1}</td>
                                <td>{result.studentName}</td>
                                <td>{result.studentUsername}</td>
                                <td>{result.score.toFixed(2)}</td>
                                <td>{(result.percentageScore * 100).toFixed(1)}%</td>
                                <td>
                                  <Badge bg={result.isPassed ? 'success' : 'danger'}>
                                    {result.isPassed ? 'Đạt' : 'Không đạt'}
                                  </Badge>
                                </td>
                                <td>{result.correctAnswers}</td>
                                <td>{result.totalQuestions}</td>
                                <td>{calculateDuration(result.startedAt, result.completedAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </StyledTable>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <Alert variant="info">
                  Không có dữ liệu bài thi nào cho lớp này.
                </Alert>
              )}
            </Tab>
          </Tabs>
        </>
      )}
      
      {!loading && !error && !selectedClassroom && (
        <Alert variant="info">
          Vui lòng chọn lớp học để xem kết quả.
        </Alert>
      )}
    </StyledContainer>
  );
};

export default TeacherClassResults;