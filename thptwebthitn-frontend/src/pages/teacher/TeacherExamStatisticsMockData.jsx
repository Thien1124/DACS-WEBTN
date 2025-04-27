import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Nav } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { FaDownload, FaSync, FaChartBar, FaBook } from 'react-icons/fa';
import styled from 'styled-components';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Styled components (giữ nguyên từ file gốc)
const StatsCard = styled(Card)`
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.1);
  }
`;

const ChartContainer = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: ${props => props.color || (props.theme === 'dark' ? '#e2e8f0' : '#2d3748')};
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#cbd5e0' : '#718096'};
`;

const TabNav = styled(Nav)`
  margin-bottom: 1.5rem;
`;

const TabButton = styled(Nav.Link)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  border-radius: 0.5rem;
  margin-right: 0.75rem;
  cursor: pointer;
  background-color: ${props => props.active 
    ? (props.theme === 'dark' ? '#4a5568' : '#e2e8f0')
    : (props.theme === 'dark' ? '#2d3748' : '#f8f9fa')
  };
  color: ${props => props.active
    ? (props.theme === 'dark' ? 'white' : '#2d3748')
    : (props.theme === 'dark' ? '#cbd5e0' : '#4a5568')
  };
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    color: ${props => props.theme === 'dark' ? 'white' : '#2d3748'};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

// DỮ LIỆU MẪU
const MOCK_EXAMS = [
  { id: 1, title: "Kiểm tra giữa kỳ Toán học" },
  { id: 2, title: "Kiểm tra 1 tiết Vật lý" },
  { id: 3, title: "Đề cương ôn tập Hóa học" },
  { id: 4, title: "Bài kiểm tra 15 phút Văn học" },
  { id: 5, title: "Đề thi học kỳ 1 Tiếng Anh" }
];

const MOCK_EXAM_STATISTICS = {
  1: {
    id: 1,
    title: "Kiểm tra giữa kỳ Toán học",
    subjectName: "Toán học",
    duration: 45,
    totalQuestions: 25,
    totalScore: 10,
    passScore: 5,
    results: [
      { id: 1, studentName: "Nguyễn Văn A", score: 8.5 },
      { id: 2, studentName: "Trần Thị B", score: 7.0 },
      { id: 3, studentName: "Lê Văn C", score: 9.0 },
      { id: 4, studentName: "Phạm Thị D", score: 5.5 },
      { id: 5, studentName: "Hoàng Văn E", score: 4.5 },
      { id: 6, studentName: "Đỗ Thị F", score: 3.0 },
      { id: 7, studentName: "Ngô Văn G", score: 6.5 },
      { id: 8, studentName: "Vũ Thị H", score: 7.5 },
      { id: 9, studentName: "Đặng Văn I", score: 8.0 },
      { id: 10, studentName: "Bùi Thị K", score: 9.5 }
    ]
  },
  2: {
    id: 2,
    title: "Kiểm tra 1 tiết Vật lý",
    subjectName: "Vật lý",
    duration: 45,
    totalQuestions: 20,
    totalScore: 10,
    passScore: 5,
    results: [
      { id: 11, studentName: "Nguyễn Văn L", score: 6.0 },
      { id: 12, studentName: "Trần Thị M", score: 7.5 },
      { id: 13, studentName: "Lê Văn N", score: 4.0 },
      { id: 14, studentName: "Phạm Thị O", score: 5.0 },
      { id: 15, studentName: "Hoàng Văn P", score: 8.5 },
      { id: 16, studentName: "Đỗ Thị Q", score: 9.0 },
      { id: 17, studentName: "Ngô Văn R", score: 3.5 },
      { id: 18, studentName: "Vũ Thị S", score: 7.0 }
    ]
  },
  3: {
    id: 3,
    title: "Đề cương ôn tập Hóa học",
    subjectName: "Hóa học",
    duration: 30,
    totalQuestions: 15,
    totalScore: 10,
    passScore: 6,
    results: [
      { id: 19, studentName: "Nguyễn Văn T", score: 8.0 },
      { id: 20, studentName: "Trần Thị U", score: 7.0 },
      { id: 21, studentName: "Lê Văn V", score: 9.0 },
      { id: 22, studentName: "Phạm Thị X", score: 6.5 },
      { id: 23, studentName: "Hoàng Văn Y", score: 5.5 },
      { id: 24, studentName: "Đỗ Thị Z", score: 7.5 }
    ]
  },
  4: {
    id: 4,
    title: "Bài kiểm tra 15 phút Văn học",
    subjectName: "Ngữ văn",
    duration: 15,
    totalQuestions: 10,
    totalScore: 10,
    passScore: 5,
    results: [
      { id: 25, studentName: "Nguyễn Văn AA", score: 7.0 },
      { id: 26, studentName: "Trần Thị BB", score: 8.0 },
      { id: 27, studentName: "Lê Văn CC", score: 6.0 },
      { id: 28, studentName: "Phạm Thị DD", score: 9.0 },
      { id: 29, studentName: "Hoàng Văn EE", score: 5.0 },
      { id: 30, studentName: "Đỗ Thị FF", score: 4.0 },
      { id: 31, studentName: "Ngô Văn GG", score: 8.5 },
      { id: 32, studentName: "Vũ Thị HH", score: 7.5 }
    ]
  },
  5: {
    id: 5,
    title: "Đề thi học kỳ 1 Tiếng Anh",
    subjectName: "Tiếng Anh",
    duration: 60,
    totalQuestions: 50,
    totalScore: 10,
    passScore: 5,
    results: [
      { id: 33, studentName: "Nguyễn Văn II", score: 9.0 },
      { id: 34, studentName: "Trần Thị KK", score: 8.5 },
      { id: 35, studentName: "Lê Văn LL", score: 7.5 },
      { id: 36, studentName: "Phạm Thị MM", score: 6.5 },
      { id: 37, studentName: "Hoàng Văn NN", score: 5.5 },
      { id: 38, studentName: "Đỗ Thị OO", score: 4.5 },
      { id: 39, studentName: "Ngô Văn PP", score: 3.5 },
      { id: 40, studentName: "Vũ Thị QQ", score: 8.0 },
      { id: 41, studentName: "Đặng Văn RR", score: 9.5 },
      { id: 42, studentName: "Bùi Thị SS", score: 7.0 }
    ]
  }
};

const MOCK_SUBJECT_STATISTICS = [
  { subjectId: 1, subjectName: "Toán học", examCount: 5, attemptCount: 45, averageScore: 7.8 },
  { subjectId: 2, subjectName: "Vật lý", examCount: 3, attemptCount: 28, averageScore: 6.5 },
  { subjectId: 3, subjectName: "Hóa học", examCount: 4, attemptCount: 32, averageScore: 7.2 },
  { subjectId: 4, subjectName: "Ngữ văn", examCount: 3, attemptCount: 27, averageScore: 6.8 },
  { subjectId: 5, subjectName: "Tiếng Anh", examCount: 4, attemptCount: 36, averageScore: 7.5 },
  { subjectId: 6, subjectName: "Sinh học", examCount: 2, attemptCount: 18, averageScore: 6.9 },
  { subjectId: 7, subjectName: "Lịch sử", examCount: 2, attemptCount: 16, averageScore: 7.0 },
  { subjectId: 8, subjectName: "Địa lý", examCount: 2, attemptCount: 15, averageScore: 6.7 }
];

const TeacherExamStatisticsMockData = () => {
  const { theme } = useSelector(state => state.ui) || { theme: 'light' };
  
  // States
  const [activeTab, setActiveTab] = useState('exams');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [examStats, setExamStats] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [subjectStats, setSubjectStats] = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectError, setSubjectError] = useState(null);
  
  // Tính toán tổng hợp
  const [summary, setSummary] = useState({
    totalStudents: 0,
    averageScore: 0,
    passRate: 0,
    highestScore: 0,
    lowestScore: 0
  });

  // Khởi tạo dữ liệu mẫu khi component mount
  useEffect(() => {
    // Load dữ liệu mẫu cho bài thi
    setExams(MOCK_EXAMS);
    if (MOCK_EXAMS.length > 0) {
      setSelectedExam(MOCK_EXAMS[0].id.toString());
    }
  }, []);

  // Khi chọn bài thi
  useEffect(() => {
    if (selectedExam) {
      fetchExamStatistics(selectedExam);
    }
  }, [selectedExam]);

  // Khi chọn tab
  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjectStatistics();
    }
  }, [activeTab]);

  // Giả lập API call - Lấy thống kê bài thi
  const fetchExamStatistics = async (examId) => {
    // Giả lập loading
    setLoading(true);
    
    // Đợi 500ms để giả lập mạng
    setTimeout(() => {
      try {
        // Lấy dữ liệu mẫu
        const stats = MOCK_EXAM_STATISTICS[examId];
        
        if (!stats) {
          setError("Không tìm thấy dữ liệu thống kê cho bài thi này");
          setExamStats(null);
          setLoading(false);
          return;
        }
        
        setExamStats(stats);
        
        // Tính toán các thống kê tổng hợp
        const results = stats.results || [];
        if (results.length > 0) {
          const scores = results.map(r => r.score || 0);
          const passThreshold = stats.passScore || 5;
          
          setSummary({
            totalStudents: results.length,
            averageScore: scores.reduce((a, b) => a + b, 0) / results.length,
            passRate: (results.filter(r => (r.score || 0) >= passThreshold).length / results.length) * 100,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores)
          });
        }
        
        setError(null);
      } catch (err) {
        setError(`Lỗi khi xử lý dữ liệu: ${err.message}`);
        setExamStats(null);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  // Giả lập API call - Lấy thống kê môn học
  const fetchSubjectStatistics = async () => {
    // Giả lập loading
    setSubjectLoading(true);
    
    // Đợi 500ms để giả lập mạng
    setTimeout(() => {
      try {
        setSubjectStats(MOCK_SUBJECT_STATISTICS);
        setSubjectError(null);
      } catch (err) {
        setSubjectError(`Lỗi khi xử lý dữ liệu: ${err.message}`);
        setSubjectStats([]);
      } finally {
        setSubjectLoading(false);
      }
    }, 500);
  };

  // Xuất PDF (giả lập)
  const exportToPDF = async () => {
    alert('Tính năng xuất PDF sẽ hoạt động trong phiên bản thực tế');
  };

  // Hàm để tạo dữ liệu biểu đồ cột
  const getBarChartData = () => {
    if (!examStats?.results) return null;
    
    // Tạo nhóm điểm số (0-1, 1-2, ..., 9-10)
    const scoreGroups = Array(10).fill(0);
    
    examStats.results.forEach(result => {
      const score = result.score || 0;
      const groupIndex = Math.min(Math.floor(score), 9);
      scoreGroups[groupIndex]++;
    });
    
    return {
      labels: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'],
      datasets: [
        {
          label: 'Số học sinh',
          data: scoreGroups,
          backgroundColor: theme === 'dark' 
            ? 'rgba(99, 179, 237, 0.7)' 
            : 'rgba(54, 162, 235, 0.7)',
          borderColor: theme === 'dark' 
            ? 'rgba(99, 179, 237, 1)' 
            : 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  // Hàm để tạo dữ liệu biểu đồ tròn
  const getPieChartData = () => {
    if (!examStats?.results) return null;
    
    const passThreshold = examStats.passScore || 5;
    
    const passCount = examStats.results.filter(r => (r.score || 0) >= passThreshold).length;
    const failCount = examStats.results.length - passCount;
    
    return {
      labels: ['Đạt', 'Không đạt'],
      datasets: [
        {
          data: [passCount, failCount],
          backgroundColor: theme === 'dark' 
            ? ['rgba(72, 187, 120, 0.7)', 'rgba(245, 101, 101, 0.7)'] 
            : ['rgba(72, 187, 120, 0.8)', 'rgba(245, 101, 101, 0.8)'],
          borderColor: theme === 'dark' 
            ? ['rgba(72, 187, 120, 1)', 'rgba(245, 101, 101, 1)'] 
            : ['rgba(72, 187, 120, 1)', 'rgba(245, 101, 101, 1)'],
          borderWidth: 1,
        }
      ]
    };
  };

  // Hàm để tạo dữ liệu biểu đồ cột cho môn học
  const getSubjectBarChartData = () => {
    if (!subjectStats || subjectStats.length === 0) return null;
    
    return {
      labels: subjectStats.map(stat => stat.subjectName || `Môn học ID: ${stat.subjectId}`),
      datasets: [
        {
          label: 'Số đề thi',
          data: subjectStats.map(stat => stat.examCount),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Lượt thi',
          data: subjectStats.map(stat => stat.attemptCount),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Hàm để tạo dữ liệu biểu đồ cho điểm trung bình môn học
  const getSubjectAverageScoreData = () => {
    if (!subjectStats || subjectStats.length === 0) return null;
    
    return {
      labels: subjectStats.map(stat => stat.subjectName || `Môn học ID: ${stat.subjectId}`),
      datasets: [
        {
          label: 'Điểm trung bình',
          data: subjectStats.map(stat => stat.averageScore),
          backgroundColor: theme === 'dark' 
            ? 'rgba(99, 179, 237, 0.7)' 
            : 'rgba(54, 162, 235, 0.7)',
          borderColor: theme === 'dark' 
            ? 'rgba(99, 179, 237, 1)' 
            : 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Thiết lập các tùy chọn biểu đồ
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Phân bố điểm số',
        color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme === 'dark' ? '#e2e8f0' : '#2d3748'
        }
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme === 'dark' ? '#e2e8f0' : '#2d3748'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'right',
        labels: {
          color: theme === 'dark' ? '#e2e8f0' : '#2d3748'
        }
      },
      title: {
        display: true,
        text: 'Tỷ lệ đạt/không đạt',
        color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
        font: { size: 16 }
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Thống Kê Kết Quả Bài Thi (Demo Mẫu)</h2>
      
      {/* Tab Navigation */}
      <TabNav variant="pills" className="mb-4">
        <TabButton
          active={activeTab === 'exams'}
          onClick={() => setActiveTab('exams')}
          theme={theme}
        >
          <FaChartBar /> Thống kê theo bài thi
        </TabButton>
        <TabButton
          active={activeTab === 'subjects'}
          onClick={() => setActiveTab('subjects')}
          theme={theme}
        >
          <FaBook /> Thống kê theo môn học
        </TabButton>
      </TabNav>
      
      {/* Tab Content */}
      {activeTab === 'exams' ? (
        // Thống kê theo bài thi
        <>
          {error && (
            <Alert variant="danger" className="mb-4">
              <strong>Lỗi:</strong> {error}
            </Alert>
          )}
          
          <Card className="mb-4" bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chọn bài thi</Form.Label>
                    <Form.Select
                      value={selectedExam}
                      onChange={(e) => setSelectedExam(e.target.value)}
                      disabled={loading || exams.length === 0}
                      className={theme === 'dark' ? 'bg-dark text-white border-dark' : ''}
                    >
                      <option value="">-- Chọn bài thi --</option>
                      {exams.map(exam => (
                        <option key={exam.id} value={exam.id.toString()}>
                          {exam.title || `Bài thi ID: ${exam.id}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Loại biểu đồ</Form.Label>
                    <Form.Select
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                      className={theme === 'dark' ? 'bg-dark text-white border-dark' : ''}
                    >
                      <option value="bar">Biểu đồ cột (Phân bố điểm)</option>
                      <option value="pie">Biểu đồ tròn (Tỷ lệ đạt/không đạt)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3} className="d-flex align-items-end justify-content-end">
                  <Button
                    variant="primary"
                    className="me-2"
                    disabled={loading || !selectedExam}
                    onClick={() => fetchExamStatistics(selectedExam)}
                  >
                    <FaSync className="me-1" /> Cập nhật
                  </Button>
                  
                  <Button
                    variant="success"
                    disabled={loading || !examStats}
                    onClick={exportToPDF}
                  >
                    <FaDownload className="me-1" /> Xuất PDF
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              {examStats && (
                <div id="exam-stats-container">
                  <Row className="mb-4">
                    <Col md={12}>
                      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                        <Card.Body>
                          <h4 className="mb-3">Thông tin bài thi</h4>
                          <Row>
                            <Col md={6}>
                              <p><strong>Tiêu đề:</strong> {examStats.title || 'Không có tiêu đề'}</p>
                              <p><strong>Môn học:</strong> {examStats.subjectName || 'Không xác định'}</p>
                              <p><strong>Thời gian làm bài:</strong> {examStats.duration || 0} phút</p>
                            </Col>
                            <Col md={6}>
                              <p><strong>Tổng số câu hỏi:</strong> {examStats.totalQuestions || 0}</p>
                              <p><strong>Điểm tối đa:</strong> {examStats.totalScore || 10}</p>
                              <p><strong>Điểm đạt:</strong> {examStats.passScore || 0}</p>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={2}>
                      <StatsCard bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                        <Card.Body className="text-center">
                          <StatValue theme={theme}>{summary.totalStudents}</StatValue>
                          <StatLabel theme={theme}>Tổng số thí sinh</StatLabel>
                        </Card.Body>
                      </StatsCard>
                    </Col>
                    <Col md={3}>
                      <StatsCard bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                        <Card.Body className="text-center">
                          <StatValue theme={theme} color="#3182ce">{summary.averageScore.toFixed(2)}</StatValue>
                          <StatLabel theme={theme}>Điểm trung bình</StatLabel>
                        </Card.Body>
                      </StatsCard>
                    </Col>
                    <Col md={3}>
                      <StatsCard bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                        <Card.Body className="text-center">
                          <StatValue theme={theme} color="#48bb78">{summary.passRate.toFixed(1)}%</StatValue>
                          <StatLabel theme={theme}>Tỉ lệ đạt</StatLabel>
                        </Card.Body>
                      </StatsCard>
                    </Col>
                    <Col md={2}>
                      <StatsCard bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                        <Card.Body className="text-center">
                          <StatValue theme={theme} color="#38a169">{summary.highestScore.toFixed(1)}</StatValue>
                          <StatLabel theme={theme}>Điểm cao nhất</StatLabel>
                        </Card.Body>
                      </StatsCard>
                    </Col>
                    <Col md={2}>
                      <StatsCard bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                        <Card.Body className="text-center">
                          <StatValue theme={theme} color="#e53e3e">{summary.lowestScore.toFixed(1)}</StatValue>
                          <StatLabel theme={theme}>Điểm thấp nhất</StatLabel>
                        </Card.Body>
                      </StatsCard>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <ChartContainer theme={theme}>
                        <div style={{ height: '400px' }}>
                          {chartType === 'bar' && getBarChartData() && (
                            <Bar data={getBarChartData()} options={barOptions} />
                          )}
                          
                          {chartType === 'pie' && getPieChartData() && (
                            <Pie data={getPieChartData()} options={pieOptions} />
                          )}
                        </div>
                      </ChartContainer>
                    </Col>
                  </Row>

                  {/* Bảng danh sách học sinh */}
                  <Row>
                    <Col md={12}>
                      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                        <Card.Body>
                          <h4 className="mb-3">Kết quả chi tiết</h4>
                          <div className="table-responsive">
                            <table className={`table table-striped ${theme === 'dark' ? 'table-dark' : ''}`}>
                              <thead>
                                <tr>
                                  <th>STT</th>
                                  <th>Họ và tên</th>
                                  <th>Điểm số</th>
                                  <th>Kết quả</th>
                                </tr>
                              </thead>
                              <tbody>
                                {examStats.results.map((result, index) => (
                                  <tr key={result.id || index}>
                                    <td>{index + 1}</td>
                                    <td>{result.studentName}</td>
                                    <td>{result.score}</td>
                                    <td>
                                      <span className={`badge bg-${result.score >= examStats.passScore ? 'success' : 'danger'}`}>
                                        {result.score >= examStats.passScore ? 'Đạt' : 'Không đạt'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}
              
              {!examStats && selectedExam && !loading && (
                <Alert variant="info">
                  Không có dữ liệu thống kê cho bài thi này hoặc chưa có học sinh làm bài.
                </Alert>
              )}
              
              {!selectedExam && (
                <Alert variant="info">
                  Vui lòng chọn một bài thi từ danh sách để xem thống kê.
                </Alert>
              )}
            </>
          )}
        </>
      ) : (
        // Thống kê theo môn học
        <>
          {subjectError && (
            <Alert variant="danger" className="mb-4">
              <strong>Lỗi:</strong> {subjectError}
            </Alert>
          )}
          
          <Card className="mb-4" bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h4>Thống kê tổng hợp theo môn học</h4>
                  <p>Biểu đồ hiển thị số lượng đề thi, lượt thi và điểm trung bình theo từng môn học.</p>
                </Col>
                <Col md={6} className="d-flex align-items-center justify-content-end">
                  <Button
                    variant="primary"
                    disabled={subjectLoading}
                    onClick={fetchSubjectStatistics}
                  >
                    <FaSync className="me-1" /> Cập nhật dữ liệu
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {subjectLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Đang tải thống kê môn học...</p>
            </div>
          ) : (
            <>
              {subjectStats && subjectStats.length > 0 ? (
                <div id="subject-stats-container">
                  {/* Bảng tổng quan */}
                  <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4">
                    <Card.Body>
                      <h4 className="mb-3">Tổng quan theo môn học</h4>
                      <div className="table-responsive">
                        <table className={`table ${theme === 'dark' ? 'table-dark' : ''}`}>
                          <thead>
                            <tr>
                              <th>Môn học</th>
                              <th>Số đề thi</th>
                              <th>Lượt thi</th>
                              <th>Điểm trung bình</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subjectStats.map((stat, index) => (
                              <tr key={index}>
                                <td>{stat.subjectName || `Môn học ID: ${stat.subjectId}`}</td>
                                <td>{stat.examCount}</td>
                                <td>{stat.attemptCount}</td>
                                <td>{stat.averageScore ? stat.averageScore.toFixed(2) : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  {/* Biểu đồ đề thi và lượt thi */}
                  <Row>
                    <Col md={6}>
                      <ChartContainer theme={theme}>
                        <h5 className="text-center mb-4">Số đề thi và lượt thi theo môn học</h5>
                        <div style={{ height: '400px' }}>
                          {getSubjectBarChartData() && (
                            <Bar 
                              data={getSubjectBarChartData()} 
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                  y: { beginAtZero: true }
                                }
                              }} 
                            />
                          )}
                        </div>
                      </ChartContainer>
                    </Col>
                    <Col md={6}>
                      <ChartContainer theme={theme}>
                        <h5 className="text-center mb-4">Điểm trung bình theo môn học</h5>
                        <div style={{ height: '400px' }}>
                          {getSubjectAverageScoreData() && (
                            <Bar 
                              data={getSubjectAverageScoreData()} 
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                  y: { 
                                    beginAtZero: true,
                                    max: 10
                                  }
                                }
                              }} 
                            />
                          )}
                        </div>
                      </ChartContainer>
                    </Col>
                  </Row>
                </div>
              ) : (
                <Alert variant="info">
                  Không có dữ liệu thống kê môn học. Có thể chưa có bài thi hoặc lượt thi nào được ghi nhận.
                </Alert>
              )}
            </>
          )}
        </>
      )}
      
      {/* Thêm thông báo demo */}
      <Alert variant="warning" className="mt-4">
        <strong>Lưu ý:</strong> Đây là phiên bản demo sử dụng dữ liệu mẫu. Trong phiên bản thực tế, dữ liệu sẽ được lấy từ API.
      </Alert>
    </Container>
  );
};

export default TeacherExamStatisticsMockData;