import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Nav } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config/constants';
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
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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

// Styled components
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

const TeacherExamStatistics = () => {
  const { theme } = useSelector(state => state.ui);
  
  // Thêm state cho tabs
  const [activeTab, setActiveTab] = useState('exams');
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [examStats, setExamStats] = useState(null);
  const [chartType, setChartType] = useState('bar');
  
  // Thêm state cho thống kê theo môn học
  const [subjectStats, setSubjectStats] = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectError, setSubjectError] = useState(null);
  
  // Thống kê tổng hợp
  const [summary, setSummary] = useState({
    totalStudents: 0,
    averageScore: 0,
    passRate: 0,
    highestScore: 0,
    lowestScore: 0
  });

  // Fetch danh sách bài thi của giáo viên
  useEffect(() => {
    const fetchExams = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Sửa gọi API để phù hợp với cấu trúc API mới
    const response = await axios.get(`${API_URL}/api/Exam`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        Page: 1,
        PageSize: 10,
        ActiveOnly: true,
        // Không có teacherId trong API docs nhưng giữ lại nếu backend hỗ trợ
        teacherId: user?.id
      }
    });
    
    console.log('Exam API response:', response);
    
    // Xử lý response data theo cấu trúc API mới
    let examList = [];
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      examList = response.data.data;
    } else if (Array.isArray(response.data)) {
      examList = response.data;
    }
    
    console.log('Processed exams:', examList);
    setExams(examList);
    
    // Tự động chọn bài thi đầu tiên nếu có
    if (examList.length > 0 && !selectedExam) {
      setSelectedExam(examList[0].id);
    }
    
    setError(null);
  } catch (err) {
    console.error('Error fetching exams:', err);
    setError(`Không thể tải danh sách bài thi: ${err.message}`);
    setExams([]);
  } finally {
    setLoading(false);
  }
};
    
    fetchExams();
  }, []);

  // Lấy thống kê khi chọn bài thi
  useEffect(() => {
    if (selectedExam) {
      fetchExamStatistics(selectedExam);
    }
  }, [selectedExam]);

  // Thêm useEffect để lấy thống kê theo môn học khi tab thay đổi
  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjectStatistics();
    }
  }, [activeTab]);

  // Thêm hàm lấy thống kê theo môn học
  const fetchSubjectStatistics = async () => {
    try {
      setSubjectLoading(true);
      const token = localStorage.getItem('token');
      
      // Gọi API mới để lấy thống kê theo môn
      const response = await axios.get(`${API_URL}/api/Statistics/by-subject`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Subject statistics API response:', response);
      
      // Xử lý dữ liệu
      let statsData = [];
      if (Array.isArray(response.data)) {
        statsData = response.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        statsData = response.data.items;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        statsData = response.data.data;
      }
      
      console.log('Processed subject statistics:', statsData);
      setSubjectStats(statsData);
      setSubjectError(null);
    } catch (err) {
      console.error('Error fetching subject statistics:', err);
      console.error('Error response:', err.response?.data);
      setSubjectError(`Không thể tải thống kê theo môn học: ${err.message}`);
      setSubjectStats([]);
    } finally {
      setSubjectLoading(false);
    }
  };

  // Sửa lại hàm lấy thống kê bài thi
const fetchExamStatistics = async (examId) => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Sử dụng API analytics/test để thống kê đề thi
    const response = await axios.get(`${API_URL}/api/analytics/test/${examId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Exam analytics response:', response.data);
    
    if (response.data && response.data.success && response.data.data) {
      const analyticsData = response.data.data;
      
      // Cấu trúc dữ liệu phù hợp với API mới
      const statsData = {
        id: analyticsData.examInfo?.id,
        title: analyticsData.examInfo?.title,
        subjectName: analyticsData.examInfo?.subjectName,
        totalScore: analyticsData.examInfo?.totalScore || 10,
        passScore: analyticsData.examInfo?.passScore || 5,
        attemptCount: analyticsData.attemptCount,
        averageScore: analyticsData.averageScore,
        averageTime: analyticsData.averageTime,
        passRate: analyticsData.passRate,
        scoreDistribution: analyticsData.scoreDistribution || [],
        mostMissedQuestions: analyticsData.mostMissedQuestions || [],
        questionAnalytics: analyticsData.questionAnalytics || []
      };
      
      setExamStats(statsData);
      
      // Cập nhật thống kê tổng hợp
      setSummary({
        totalStudents: statsData.attemptCount || 0,
        averageScore: statsData.averageScore || 0,
        passRate: statsData.passRate || 0,
        averageTime: statsData.averageTime || 0,
        highestScore: statsData.scoreDistribution?.length > 0 ? 
          parseFloat(statsData.scoreDistribution[statsData.scoreDistribution.length - 1].range.split(' - ')[1]) : 0,
        lowestScore: statsData.scoreDistribution?.length > 0 ? 
          parseFloat(statsData.scoreDistribution[0].range.split(' - ')[0]) : 0
      });
      
      setError(null);
    } else {
      throw new Error('Dữ liệu không hợp lệ hoặc không có thống kê');
    }
  } catch (err) {
    console.error('Error fetching exam statistics:', err);
    
    // Kiểm tra loại lỗi để đưa ra thông báo phù hợp
    if (err.response?.status === 404) {
      setError(`Không tìm thấy thống kê cho đề thi ID:${examId}`);
    } else if (err.response?.status === 401) {
      setError(`Bạn không có quyền xem thống kê đề thi này`);
    } else {
      setError(`Không thể tải thống kê đề thi: ${err.message}`);
    }
    
    setExamStats(null);
  } finally {
    setLoading(false);
  }
};
  // Hàm xuất báo cáo PDF
  const exportToPDF = async () => {
    if (!examStats) return;
    
    try {
      const statsContainer = document.getElementById('exam-stats-container');
      const canvas = await html2canvas(statsContainer);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`thong-ke-bai-thi-${selectedExam}.pdf`);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      alert('Có lỗi khi xuất báo cáo PDF. Vui lòng thử lại sau.');
    }
  };

  // Dữ liệu và tùy chọn cho biểu đồ thanh (điểm số)
  const getBarChartData = () => {
  if (!examStats?.scoreDistribution) return null;
  
  return {
    labels: examStats.scoreDistribution.map(item => item.range),
    datasets: [
      {
        label: 'Số học sinh',
        data: examStats.scoreDistribution.map(item => item.count),
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

  // Dữ liệu và tùy chọn cho biểu đồ tròn (tỷ lệ đỗ/trượt)
  const getPieChartData = () => {
  if (!examStats) return null;
  
  const passCount = Math.round((examStats.passRate / 100) * examStats.attemptCount);
  const failCount = examStats.attemptCount - passCount;
  
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
      <h2 className="mb-4">Thống Kê Kết Quả Đề Thi</h2>
      
      {/* Tab Navigation */}
      <TabNav variant="pills" className="mb-4">
        <TabButton
          active={activeTab === 'exams'}
          onClick={() => setActiveTab('exams')}
          theme={theme}
        >
          <FaChartBar /> Thống kê theo đề thi
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
                    <Form.Label>Chọn đề thi</Form.Label>
                    <Form.Select
                      value={selectedExam}
                      onChange={(e) => setSelectedExam(e.target.value)}
                      disabled={loading || exams.length === 0}
                      className={theme === 'dark' ? 'bg-dark text-white border-dark' : ''}
                    >
                      <option value="">-- Chọn bài thi --</option>
                      {exams.map(exam => (
                        <option key={exam.id} value={exam.id}>
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
                          <StatLabel theme={theme}>Tổng số lượt thi</StatLabel>
                        </Card.Body>
                      </StatsCard>
                    </Col>
                    <Col md={2}>
                      <StatsCard bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                        <Card.Body className="text-center">
                          <StatValue theme={theme} color="#3182ce">{summary.averageScore.toFixed(2)}</StatValue>
                          <StatLabel theme={theme}>Điểm trung bình</StatLabel>
                        </Card.Body>
                      </StatsCard>
                    </Col>
                    <Col md={2}>
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
                          <StatValue theme={theme} color="#805ad5">{summary.averageTime} phút</StatValue>
                          <StatLabel theme={theme}>Thời gian trung bình</StatLabel>
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

                  {/* Bảng chi tiết (có thể thêm nếu cần) */}
                  {examStats?.mostMissedQuestions && examStats.mostMissedQuestions.length > 0 && (
                    <Row className="mt-4">
                      <Col md={12}>
                        <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                          <Card.Body>
                            <h4 className="mb-3">Câu hỏi sai nhiều nhất</h4>
                            <div className="table-responsive">
                              <table className={`table ${theme === 'dark' ? 'table-dark' : ''}`}>
                                <thead>
                                  <tr>
                                    <th>STT</th>
                                    <th>Nội dung câu hỏi</th>
                                    <th>Tỷ lệ sai (%)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {examStats.mostMissedQuestions.map((question, index) => (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{question.questionText || `Câu hỏi ID: ${question.questionId}`}</td>
                                      <td>{question.incorrectPercentage.toFixed(1)}%</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  )}
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
                                <td>{stat.subject?.name || "Chưa phân loại"}</td>
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
    </Container>
  );
};

export default TeacherExamStatistics;