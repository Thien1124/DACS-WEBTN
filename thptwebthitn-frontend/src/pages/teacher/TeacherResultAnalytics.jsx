import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaChartBar, FaChartPie, FaClock, FaFileDownload, FaFilter, FaSearch } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { API_URL } from '../../config/constants';
import { showSuccessToast } from '../../utils/toastUtils';
import { generateMockResults, generateMockExamDetails } from '../../utils/mockData';

import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { showErrorToast } from '../../utils/toastUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Đăng ký các components của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TeacherResultAnalytics = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { theme } = useSelector(state => state.ui);
  const [loading, setLoading] = useState(true);
  
  // Tạo state cho dữ liệu mẫu
  const [examDetails, setExamDetails] = useState(null);
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    averageDuration: 0,
    mostDifficultQuestions: [],
    easiestQuestions: [],
    questionStats: []
  });
  
  // Danh sách môn học mẫu
  const mockSubjects = [
    { id: 1, name: 'Toán' },
    { id: 2, name: 'Vật lý' },
    { id: 3, name: 'Hóa học' },
    { id: 4, name: 'Sinh học' },
    { id: 5, name: 'Ngữ văn' },
    { id: 6, name: 'Lịch sử' },
    { id: 7, name: 'Địa lý' },
    { id: 8, name: 'Tiếng Anh' }
  ];
  
  // Danh sách đề thi mẫu
  const mockExams = [
    { id: 1, title: 'Bài kiểm tra 15 phút - Đại số', subjectId: 1 },
    { id: 2, title: 'Bài kiểm tra 1 tiết - Hình học', subjectId: 1 },
    { id: 3, title: 'Bài kiểm tra học kỳ 1 - Toán', subjectId: 1 },
    { id: 4, title: 'Bài kiểm tra chuyên đề - Vật lý điện', subjectId: 2 },
    { id: 5, title: 'Bài kiểm tra giữa kỳ - Vật lý', subjectId: 2 },
    { id: 6, title: 'Bài kiểm tra 1 tiết - Hóa học đại cương', subjectId: 3 }
  ];
  
  const [subjects, setSubjects] = useState(mockSubjects);
  const [exams, setExams] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    subjectId: examId ? '1' : '',
    examId: examId || '1',
    dateFrom: '',
    dateTo: ''
  });

  // Tải danh sách đề thi khi môn học thay đổi - chỉ lọc từ dữ liệu mẫu
  useEffect(() => {
    if (filters.subjectId) {
      const filteredExams = mockExams.filter(exam => 
        exam.subjectId == filters.subjectId
      );
      setExams(filteredExams);
    } else {
      setExams(mockExams);
    }
  }, [filters.subjectId]);
  
  // Load dữ liệu mẫu ngay khi component được tải
  useEffect(() => {
    loadMockData();
  }, []);
  
  // Tự động tải lại dữ liệu mẫu khi đề thi thay đổi
  useEffect(() => {
    if (filters.examId) {
      loadMockData();
    }
  }, [filters.examId]);
  
  // Hàm tải dữ liệu mẫu
  const loadMockData = () => {
    setLoading(true);
    
    setTimeout(() => {
      const mockExam = generateMockExamDetails(filters.examId || 1);
      const mockResults = generateMockResults(filters.examId || 1, 30);
      
      setExamDetails(mockExam);
      setResults(mockResults);
      
      // Tính toán thống kê
      calculateStatistics(mockResults, mockExam);
      
      setLoading(false);
      showSuccessToast('Đã tải dữ liệu phân tích mẫu');
    }, 800); // Thêm độ trễ nhỏ để có hiệu ứng loading
  };
  
  // Tính toán thống kê từ dữ liệu
  const calculateStatistics = (resultsData, examDetailsData) => {
    const totalAttempts = resultsData.length;
    
    // Average score
    const totalScore = resultsData.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalScore / totalAttempts;
    
    // Pass rate
    const passCount = resultsData.filter(result => 
      result.score >= (examDetailsData.passScore || 5)
    ).length;
    const passRate = (passCount / totalAttempts) * 100;
    
    // Average duration
    const totalDuration = resultsData.reduce((sum, result) => {
      if (typeof result.duration === 'string') {
        const parts = result.duration.split(':');
        const durationInSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        return sum + durationInSeconds;
      } else if (typeof result.duration === 'number') {
        return sum + result.duration;
      }
      return sum;
    }, 0);
    const averageDuration = totalDuration / totalAttempts;
    
    // Question analysis
    const questionStats = [];
    
    // Xử lý thống kê câu hỏi
    if (resultsData[0]?.answers && Array.isArray(resultsData[0].answers)) {
      const questionMap = new Map();
      
      resultsData.forEach(result => {
        if (result.answers && Array.isArray(result.answers)) {
          result.answers.forEach(answer => {
            if (!questionMap.has(answer.questionId)) {
              questionMap.set(answer.questionId, { 
                questionId: answer.questionId,
                content: answer.questionContent || `Câu hỏi ${answer.questionId}`,
                totalAnswers: 0,
                correctAnswers: 0,
                avgTimeSpent: 0,
                totalTimeSpent: 0
              });
            }
            
            const questionStat = questionMap.get(answer.questionId);
            questionStat.totalAnswers++;
            
            if (answer.isCorrect) {
              questionStat.correctAnswers++;
            }
            
            if (answer.timeSpent) {
              questionStat.totalTimeSpent += answer.timeSpent;
            }
          });
        }
      });
      
      questionMap.forEach(stat => {
        stat.correctRate = (stat.correctAnswers / stat.totalAnswers) * 100;
        stat.avgTimeSpent = stat.totalTimeSpent / stat.totalAnswers;
        questionStats.push(stat);
      });
      
      questionStats.sort((a, b) => a.correctRate - b.correctRate);
    }
    
    setStatistics({
      totalAttempts,
      averageScore,
      passRate,
      averageDuration,
      mostDifficultQuestions: questionStats.slice(0, 5),
      easiestQuestions: [...questionStats].sort((a, b) => b.correctRate - a.correctRate).slice(0, 5),
      questionStats
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0')
    ].join(':');
  };

  // Chart data for score distribution
  const scoreDistributionData = {
    labels: ['0-2', '2-4', '4-6', '6-8', '8-10'],
    datasets: [{
      label: 'Số lượng học sinh',
      data: [
        results.filter(r => r.score >= 0 && r.score < 2).length,
        results.filter(r => r.score >= 2 && r.score < 4).length,
        results.filter(r => r.score >= 4 && r.score < 6).length,
        results.filter(r => r.score >= 6 && r.score < 8).length,
        results.filter(r => r.score >= 8 && r.score <= 10).length
      ],
      backgroundColor: theme === 'dark' ? [
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(255, 205, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(54, 162, 235, 0.7)'
      ] : [
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)'
      ],
      borderColor: theme === 'dark' ? [
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)'
      ] : [
        'rgb(0, 0, 0)',
        'rgb(0, 0, 0)',
        'rgb(0, 0, 0)',
        'rgb(0, 0, 0)',
        'rgb(0, 0, 0)'
      ],
      borderWidth: 1
    }]
  };

  // Chart data for pass/fail rate
  const passFailData = {
    labels: ['Đạt', 'Không đạt'],
    datasets: [{
      label: 'Tỷ lệ đạt/không đạt',
      data: [
        statistics.passRate,
        100 - statistics.passRate
      ],
      backgroundColor: theme === 'dark' ? [
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 99, 132, 0.7)'
      ] : [
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 99, 132, 0.8)'
      ],
      borderColor: theme === 'dark' ? [
        'rgb(255, 255, 255)',
        'rgb(255, 255, 255)'
      ] : [
        'rgb(0, 0, 0)',
        'rgb(0, 0, 0)'
      ],
      borderWidth: 1
    }]
  };

  // Chart data for question difficulty
  const questionDifficultyData = {
    labels: statistics.questionStats.slice(0, 10).map(q => `Câu ${q.questionId}`),
    datasets: [{
      label: 'Tỷ lệ trả lời đúng (%)',
      data: statistics.questionStats.slice(0, 10).map(q => q.correctRate),
      backgroundColor: theme === 'dark' ? 'rgba(54, 162, 235, 0.7)' : 'rgba(54, 162, 235, 0.8)',
      borderColor: theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
      borderWidth: 1
    }]
  };

  // Chart data for time spent per question
  const timeSpentData = {
    labels: statistics.questionStats.slice(0, 10).map(q => `Câu ${q.questionId}`),
    datasets: [{
      label: 'Thời gian trung bình (giây)',
      data: statistics.questionStats.slice(0, 10).map(q => q.avgTimeSpent),
      backgroundColor: theme === 'dark' ? 'rgba(255, 159, 64, 0.7)' : 'rgba(255, 159, 64, 0.8)',
      borderColor: theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
      borderWidth: 1
    }]
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Phân Tích Kết Quả Đề Thi (Demo)</h2>
        <Button variant="success" onClick={loadMockData}>
          <FaChartBar className="me-2" /> Tải lại dữ liệu mẫu
        </Button>
      </div>
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4">
        <Card.Header>
          <h5>Bộ Lọc</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={(e) => { e.preventDefault(); loadMockData(); }}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Môn học</Form.Label>
                  <Form.Select
                    name="subjectId"
                    value={filters.subjectId}
                    onChange={handleFilterChange}
                    className={theme === 'dark' ? 'bg-dark text-white' : ''}
                  >
                    <option value="">Tất cả môn học</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Đề thi</Form.Label>
                  <Form.Select
                    name="examId"
                    value={filters.examId}
                    onChange={handleFilterChange}
                    className={theme === 'dark' ? 'bg-dark text-white' : ''}
                  >
                    <option value="">Chọn đề thi</option>
                    {exams.length === 0 ? (
                      <option disabled>Không tìm thấy đề thi</option>
                    ) : (
                      exams.map(exam => (
                        <option key={exam.id} value={exam.id}>
                          {exam.title}
                        </option>
                      ))
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button variant="primary" type="submit" className="d-flex align-items-center">
                <FaSearch className="me-2" /> Tìm kiếm
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải dữ liệu phân tích...</p>
        </div>
      ) : examDetails && results.length > 0 ? (
        <div id="analytics-report">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>{examDetails.title}</h3>
            <Button variant="success" onClick={() => {
              showSuccessToast('Chức năng tải báo cáo PDF sẽ có trong phiên bản tới!');
            }}>
              <FaFileDownload className="me-2" /> Tải báo cáo PDF
            </Button>
          </div>
          
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="h-100">
                <Card.Body>
                  <h5 className="mb-3">Số lần làm bài</h5>
                  <h2 className="text-center">{statistics.totalAttempts}</h2>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-3">
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="h-100">
                <Card.Body>
                  <h5 className="mb-3">Điểm trung bình</h5>
                  <h2 className="text-center">{statistics.averageScore.toFixed(2)}</h2>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-3">
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="h-100">
                <Card.Body>
                  <h5 className="mb-3">Tỷ lệ đạt</h5>
                  <h2 className="text-center">{statistics.passRate.toFixed(2)}%</h2>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-3">
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="h-100">
                <Card.Body>
                  <h5 className="mb-3">Thời gian trung bình</h5>
                  <h2 className="text-center">{formatDuration(statistics.averageDuration)}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6} className="mb-4">
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                <Card.Header>
                  <h5 className="mb-0">Phân bố điểm số</h5>
                </Card.Header>
                <Card.Body>
                  <Bar 
                    data={scoreDistributionData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                <Card.Header>
                  <h5 className="mb-0">Tỷ lệ đạt/không đạt</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-center" style={{ height: '300px' }}>
                    <Pie 
                      data={passFailData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6} className="mb-4">
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                <Card.Header>
                  <h5 className="mb-0">Tỷ lệ trả lời đúng theo câu hỏi</h5>
                </Card.Header>
                <Card.Body>
                  <Bar 
                    data={questionDifficultyData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100
                        }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                <Card.Header>
                  <h5 className="mb-0">Thời gian trung bình theo câu hỏi (giây)</h5>
                </Card.Header>
                <Card.Body>
                  <Bar 
                    data={timeSpentData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6} className="mb-4">
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                <Card.Header>
                  <h5 className="mb-0">Câu hỏi khó nhất</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nội dung</th>
                        <th>Tỷ lệ đúng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.mostDifficultQuestions.map((question, index) => (
                        <tr key={index}>
                          <td>{question.questionId}</td>
                          <td>{question.content.length > 50 ? question.content.substring(0, 50) + '...' : question.content}</td>
                          <td>
                            <Badge bg={
                              question.correctRate < 30 ? 'danger' : 
                              question.correctRate < 60 ? 'warning' : 'success'
                            }>
                              {question.correctRate.toFixed(2)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                <Card.Header>
                  <h5 className="mb-0">Câu hỏi dễ nhất</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nội dung</th>
                        <th>Tỷ lệ đúng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.easiestQuestions.map((question, index) => (
                        <tr key={index}>
                          <td>{question.questionId}</td>
                          <td>{question.content.length > 50 ? question.content.substring(0, 50) + '...' : question.content}</td>
                          <td>
                            <Badge bg={
                              question.correctRate < 30 ? 'danger' : 
                              question.correctRate < 60 ? 'warning' : 'success'
                            }>
                              {question.correctRate.toFixed(2)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Kết quả chi tiết</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'} responsive>
                <thead>
                  <tr>
                    <th>Học sinh</th>
                    <th>Điểm số</th>
                    <th>Thời gian làm bài</th>
                    <th>Ngày thi</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 10).map((result, index) => (
                    <tr key={index}>
                      <td>{result.studentName}</td>
                      <td>{result.score.toFixed(2)}</td>
                      <td>
                        {typeof result.duration === 'string' 
                          ? result.duration 
                          : formatDuration(result.duration)}
                      </td>
                      <td>{new Date(result.completedDate || result.startTime).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={
                          result.score >= (examDetails.passScore || 5) ? 'success' : 'danger'
                        }>
                          {result.score >= (examDetails.passScore || 5) ? 'Đạt' : 'Không đạt'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {results.length > 10 && (
                <div className="text-center mt-3">
                  <Button variant="outline-primary" onClick={() => showSuccessToast('Chức năng này sẽ có trong phiên bản tới!')}>
                    Xem tất cả {results.length} kết quả
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      ) : (
        <Alert variant="info" className="text-center">
          <FaChartBar size={30} className="mb-3" />
          <h5>Không có dữ liệu hiển thị</h5>
          <p className="mb-0">Hãy chọn môn học và đề thi, sau đó nhấn "Tìm kiếm" để xem phân tích.</p>
        </Alert>
      )}
    </Container>
  );
};

export default TeacherResultAnalytics;