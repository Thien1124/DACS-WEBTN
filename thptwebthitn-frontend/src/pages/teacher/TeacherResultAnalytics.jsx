import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaChartBar, FaChartPie, FaClock, FaFileDownload, FaFilter, FaSearch } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { API_URL } from '../../config/constants';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

// Import services
import { getTestAnalytics } from '../../services/analyticsService';
import { getAllSubjectsNoPaging } from '../../services/subjectService';
import { getExamsBySubject } from '../../services/examService';
import { getExamLeaderboard } from '../../services/leaderboardService';

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
  
  // State for exam data
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
  
  // Use examId from URL directly
  const [filters, setFilters] = useState({
    examId: examId || ''
  });

  // Add state for leaderboard data
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Load test analytics when component mounts if we have an examId
  useEffect(() => {
    if (examId) {
      fetchAnalyticsData();
    }
  }, [examId]);
  
  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    setLoading(true);
    
    try {
      // Use examId from URL param
      const targetExamId = examId || filters.examId;
      
      // Validate that we have an exam ID
      if (!targetExamId) {
        showErrorToast('Không tìm thấy ID đề thi');
        setLoading(false);
        return;
      }
      
      console.log(`Fetching analytics for exam: ${targetExamId}`);
      const response = await getTestAnalytics(targetExamId);
      const processLeaderboardResults = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No results to process');
    setResults([]);
    return;
  }
  
  console.log('Processing results data:', data);
  
  // Format the data to match what the table expects
  const formattedResults = data.map(item => {
    // Check for actual data structure
    console.log('Processing item:', item);
    
    return {
      studentName: item.studentName || item.fullName || item.student?.fullName || 'N/A',
      score: typeof item.score === 'number' ? item.score : 0,
      duration: item.duration || item.timeSpent || 0,
      completedDate: item.completedDate || item.completedAt || item.submittedAt || new Date().toISOString(),
      startTime: item.startTime || item.startedAt || new Date().toISOString(),
    };
  });
  
  console.log('Formatted results:', formattedResults);
  setResults(formattedResults);
};
      // Also fetch leaderboard data
      try {
        console.log('Fetching leaderboard data for exam:', targetExamId);
        const leaderboardResponse = await getExamLeaderboard(targetExamId);
        
        // Log the response to see what's coming back
        console.log('Leaderboard API response:', leaderboardResponse);
        
        if (leaderboardResponse && leaderboardResponse.success && leaderboardResponse.data) {
          console.log('Setting leaderboard data, length:', leaderboardResponse.data.length);
          setLeaderboardData(leaderboardResponse.data);
          
          // Make sure data is in the expected format for the table
          const formattedResults = leaderboardResponse.data.map(item => ({
            studentName: item.studentName || item.fullName || 'N/A',
            score: typeof item.score === 'number' ? item.score : 0,
            duration: item.duration || item.timeSpent || 0,
            completedDate: item.completedDate || item.completedAt || item.submittedAt || new Date().toISOString(),
            startTime: item.startTime || item.startedAt || new Date().toISOString(),
            // Add any other necessary fields
          }));
          
          console.log('Formatted results:', formattedResults);
          setResults(formattedResults);
        } else {
          // Try to recover by checking different response formats
          console.warn('Leaderboard data structure is not as expected');
          
          // Try alternative property paths that might exist in the response
          if (leaderboardResponse && typeof leaderboardResponse === 'object') {
            // Check if the data is directly in the response
            if (Array.isArray(leaderboardResponse)) {
              console.log('Leaderboard data is direct array, length:', leaderboardResponse.length);
              processLeaderboardResults(leaderboardResponse);
            } 
            // Check if the data is in a 'results' property
            else if (leaderboardResponse.results && Array.isArray(leaderboardResponse.results)) {
              console.log('Found results array, length:', leaderboardResponse.results.length);
              processLeaderboardResults(leaderboardResponse.results);
            }
            // Check if response has an items array
            else if (leaderboardResponse.items && Array.isArray(leaderboardResponse.items)) {
              console.log('Found items array, length:', leaderboardResponse.items.length);
              processLeaderboardResults(leaderboardResponse.items);
            }
            // Last resort - check if there's any array property
            else {
              const arrayProps = Object.keys(leaderboardResponse).filter(key => 
                Array.isArray(leaderboardResponse[key]) && leaderboardResponse[key].length > 0
              );
              
              if (arrayProps.length > 0) {
                console.log(`Found array in property ${arrayProps[0]}, length:`, leaderboardResponse[arrayProps[0]].length);
                processLeaderboardResults(leaderboardResponse[arrayProps[0]]);
              } else {
                console.warn('No usable array data found in leaderboard response');
                setResults([]);
              }
            }
          } else {
            console.warn('Leaderboard response is not a valid object');
            setResults([]);
          }
        }
      } catch (leaderboardError) {
        console.error('Failed to fetch leaderboard data:', leaderboardError);
        
        // Fallback: try to get exam results data from analyticsData if it contains student results
        if (analyticsData && analyticsData.studentResults && Array.isArray(analyticsData.studentResults)) {
          console.log('Using student results from analytics data instead');
          processLeaderboardResults(analyticsData.studentResults);
        } else {
          setResults([]);
        }
      }
      
      // Process analytics data as before
      if (!response || !response.success || !response.data) {
        showErrorToast('Không thể tải dữ liệu phân tích');
        setLoading(false);
        return;
      }
      
      const analyticsData = response.data;
      
      // Map API response to component's expected structure
      setExamDetails({
        id: analyticsData.examInfo.id,
        title: analyticsData.examInfo.title,
        subjectName: analyticsData.examInfo.subjectName,
        totalScore: analyticsData.examInfo.totalScore,
        passScore: analyticsData.examInfo.passScore
      });
      
      
      // Map the question stats to include the content field needed by the UI
      const questionStats = analyticsData.questionAnalytics 
        ? analyticsData.questionAnalytics.map(q => ({
            questionId: q.questionId,
            content: q.questionContent, // Map questionContent to content for UI compatibility
            correctRate: q.correctRate,
            avgTimeSpent: q.averageTimeSpent || 0
          }))
        : [];
      
      // Do the same for difficult questions
      const mostDifficultQuestions = analyticsData.mostMissedQuestions 
        ? analyticsData.mostMissedQuestions.map(q => ({
            questionId: q.questionId,
            content: q.questionContent, // Map questionContent to content for UI compatibility
            correctRate: q.correctRate
          }))
        : [];
        
      // Set statistics from API data
      setStatistics({
        totalAttempts: analyticsData.attemptCount || 0,
        averageScore: analyticsData.averageScore || 0,
        passRate: analyticsData.passRate || 0,
        averageDuration: analyticsData.averageTime || 0,
        mostDifficultQuestions: mostDifficultQuestions,
        easiestQuestions: questionStats.length > 0 
          ? [...questionStats].sort((a, b) => b.correctRate - a.correctRate).slice(0, 5) 
          : [],
        questionStats: questionStats
      });
      
      setLoading(false);
      showSuccessToast('Đã tải dữ liệu phân tích thành công');
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      showErrorToast('Có lỗi khi tải dữ liệu phân tích: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };
  
  // Keep the calculateStatistics function as fallback
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

  // Chart data for question difficulty - Add null checks
const questionDifficultyData = {
  labels: statistics.questionStats && statistics.questionStats.length > 0 
    ? statistics.questionStats.slice(0, 10).map(q => `Câu ${q.questionId}`)
    : [],
  datasets: [{
    label: 'Tỷ lệ trả lời đúng (%)',
    data: statistics.questionStats && statistics.questionStats.length > 0
      ? statistics.questionStats.slice(0, 10).map(q => q.correctRate)
      : [],
    backgroundColor: theme === 'dark' ? 'rgba(54, 162, 235, 0.7)' : 'rgba(54, 162, 235, 0.8)',
    borderColor: theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
    borderWidth: 1
  }]
};

// Chart data for time spent per question - Add null checks
const timeSpentData = {
  labels: statistics.questionStats && statistics.questionStats.length > 0
    ? statistics.questionStats.slice(0, 10).map(q => `Câu ${q.questionId}`)
    : [],
  datasets: [{
    label: 'Thời gian trung bình (giây)',
    data: statistics.questionStats && statistics.questionStats.length > 0
      ? statistics.questionStats.slice(0, 10).map(q => q.avgTimeSpent)
      : [],
    backgroundColor: theme === 'dark' ? 'rgba(255, 159, 64, 0.7)' : 'rgba(255, 159, 64, 0.8)',
    borderColor: theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
    borderWidth: 1
  }]
};

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Phân Tích Kết Quả Đề Thi</h2>
        <Button variant="success" onClick={fetchAnalyticsData}>
          <FaChartBar className="me-2" /> Tải lại dữ liệu
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải dữ liệu phân tích...</p>
        </div>
      ) : examDetails ? (
        // Changed to only check for examDetails, not results length
        <div id="analytics-report">
          {/* Rest of your analytics UI remains the same */}
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
        <Alert variant="warning" className="text-center">
          <FaChartBar size={30} className="mb-3" />
          <h5>Không tìm thấy dữ liệu phân tích</h5>
          <p className="mb-0">Vui lòng nhấn "Tải lại dữ liệu" để thử lại.</p>
        </Alert>
      )}
    </Container>
  );
};

export default TeacherResultAnalytics;