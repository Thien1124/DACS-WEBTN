import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { showErrorToast } from '../../utils/toastUtils';
import { 
  FaChartLine, FaChartBar, FaCalendarAlt, FaBook, 
  FaUserGraduate, FaClock, FaPercentage, FaMedal 
} from 'react-icons/fa';

import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Styled components
const PageTitle = ({ children, theme }) => (
  <div className="d-flex align-items-center mb-4 pb-2" style={{ 
    borderBottom: `2px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`,
    paddingBottom: '0.5rem'
  }}>
    <FaChartLine className="me-2" size={24} style={{ color: theme === 'dark' ? '#8ab4f8' : '#0d6efd' }} />
    <h2 className="mb-0">{children}</h2>
  </div>
);

const StatsCard = ({ icon: Icon, title, value, theme, color }) => (
  <div className="text-center p-3 h-100" style={{ 
    borderRadius: '10px',
    backgroundColor: theme === 'dark' ? '#2c3034' : '#f8f9fa',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
    cursor: 'default',
    border: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
  }}>
    <div style={{ 
      backgroundColor: theme === 'dark' ? color + '30' : color + '15', 
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 15px auto'
    }}>
      <Icon size={25} style={{ color: color }} />
    </div>
    <h5 style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#adb5bd' : '#6c757d' }}>{title}</h5>
    <p className="h3 mb-0" style={{ 
      fontWeight: 'bold', 
      color: theme === 'dark' ? color : color 
    }}>{value}</p>
  </div>
);

const ChartCard = ({ title, icon: Icon, children, theme }) => (
  <Card 
    bg={theme === 'dark' ? 'dark' : 'light'} 
    text={theme === 'dark' ? 'white' : 'dark'}
    className="mb-4 shadow-sm"
    style={{ borderRadius: '10px', overflow: 'hidden' }}
  >
    <Card.Header className="d-flex align-items-center" style={{ 
      background: theme === 'dark' ? '#212529' : '#f8f9fa',
      borderBottom: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
    }}>
      <Icon className="me-2" style={{ color: theme === 'dark' ? '#8ab4f8' : '#0d6efd' }} />
      <span style={{ fontWeight: 'bold' }}>{title}</span>
    </Card.Header>
    <Card.Body style={{ padding: '1.5rem' }}>
      {children}
    </Card.Body>
  </Card>
);

const FilterCard = ({ children, theme }) => (
  <Card 
    bg={theme === 'dark' ? 'dark' : 'light'} 
    text={theme === 'dark' ? 'white' : 'dark'}
    className="mb-4 shadow-sm"
    style={{ 
      borderRadius: '10px',
      borderLeft: `4px solid ${theme === 'dark' ? '#8ab4f8' : '#0d6efd'}` 
    }}
  >
    <Card.Body>{children}</Card.Body>
  </Card>
);

const AnalyticsCharts = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
  const { theme } = useSelector(state => state.ui);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006';
  
  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);
  
  // Fetch chart data when subject or dateRange changes
  useEffect(() => {
    if (selectedSubject) {
      fetchChartData();
    }
  }, [selectedSubject, dateRange]);
  
  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/Subject/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setSubjects(response.data);
        // Set first subject as default if available
        if (response.data.length > 0) {
          setSelectedSubject(response.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      showErrorToast('Không thể tải danh sách môn học');
    }
  };
  
  const fetchChartData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/analytics/chart-data`, {
          params: {
            subjectId: selectedSubject,
            period: dateRange
          },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data && response.data.success && response.data.data) {
        setChartData(response.data.data);
        setError(null);
      } else {
        throw new Error('Dữ liệu không hợp lệ');
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Không thể tải dữ liệu biểu đồ. Vui lòng thử lại sau.');
      showErrorToast('Có lỗi khi tải dữ liệu biểu đồ');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRangeChange = (e) => {
    setDateRange(e.target.value);
  };
  
  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };
  
  // Prepare chart options and data
  const scoreChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          color: theme === 'dark' ? '#e9ecef' : '#495057'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? '#fff' : '#000',
        bodyColor: theme === 'dark' ? '#e9ecef' : '#495057',
        borderColor: theme === 'dark' ? '#495057' : '#dee2e6',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        padding: 10
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          color: theme === 'dark' ? '#adb5bd' : '#495057'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#adb5bd' : '#495057'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };
  
  const timeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          color: theme === 'dark' ? '#e9ecef' : '#495057'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? '#fff' : '#000',
        bodyColor: theme === 'dark' ? '#e9ecef' : '#495057',
        borderColor: theme === 'dark' ? '#495057' : '#dee2e6',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        padding: 10
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === 'dark' ? '#adb5bd' : '#495057'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#adb5bd' : '#495057'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };
  
  const attemptChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          color: theme === 'dark' ? '#e9ecef' : '#495057'
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? '#fff' : '#000',
        bodyColor: theme === 'dark' ? '#e9ecef' : '#495057',
        borderColor: theme === 'dark' ? '#495057' : '#dee2e6',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        padding: 10
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: theme === 'dark' ? '#adb5bd' : '#495057'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#adb5bd' : '#495057'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };
  
  const prepareScoreChartData = () => {
    if (!chartData || !chartData.scoreChartData) return null;
    
    // Format dates to be more readable
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };
    
    return {
      labels: chartData.scoreChartData.map(item => formatDate(item.date)),
      datasets: [
        {
          label: 'Điểm trung bình',
          data: chartData.scoreChartData.map(item => item.averageScore),
          borderColor: theme === 'dark' ? '#8ab4f8' : '#0d6efd',
          backgroundColor: theme === 'dark' ? 'rgba(138, 180, 248, 0.5)' : 'rgba(13, 110, 253, 0.5)',
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: theme === 'dark' ? '#8ab4f8' : '#0d6efd',
          pointBorderColor: theme === 'dark' ? '#212529' : '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true
        }
      ],
    };
  };
  
  const prepareTimeChartData = () => {
    if (!chartData || !chartData.timeChartData) return null;
    
    // Format dates to be more readable
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };
    
    return {
      labels: chartData.timeChartData.map(item => formatDate(item.date)),
      datasets: [
        {
          label: 'Thời gian trung bình (giờ)',
          data: chartData.timeChartData.map(item => item.averageTime),
          backgroundColor: theme === 'dark' ? 'rgba(153, 102, 255, 0.8)' : 'rgba(153, 102, 255, 0.8)',
          borderColor: theme === 'dark' ? '#212529' : '#fff',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: theme === 'dark' ? 'rgba(173, 122, 255, 0.9)' : 'rgba(133, 82, 235, 0.9)'
        }
      ],
    };
  };
  
  const prepareAttemptChartData = () => {
    if (!chartData || !chartData.attemptChartData) return null;
    
    // Format dates to be more readable
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };
    
    return {
      labels: chartData.attemptChartData.map(item => formatDate(item.date)),
      datasets: [
        {
          label: 'Số lượt làm bài',
          data: chartData.attemptChartData.map(item => item.attemptCount),
          backgroundColor: theme === 'dark' ? 'rgba(255, 159, 64, 0.8)' : 'rgba(255, 159, 64, 0.8)',
          borderColor: theme === 'dark' ? '#212529' : '#fff',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: theme === 'dark' ? 'rgba(255, 179, 84, 0.9)' : 'rgba(235, 139, 44, 0.9)'
        }
      ],
    };
  };
  
  return (
    <Container className="my-4">
      <PageTitle theme={theme}>Biểu Đồ Phân Tích Kết Quả Học Tập</PageTitle>
      
      <FilterCard theme={theme}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3 d-flex align-items-center">
              <FaBook className="me-2" style={{ color: theme === 'dark' ? '#8ab4f8' : '#0d6efd' }} />
              <Form.Label className="me-3 mb-0" style={{ minWidth: '85px' }}>Môn học:</Form.Label>
              <Form.Select 
                value={selectedSubject}
                onChange={handleSubjectChange}
                className={`${theme === 'dark' ? 'bg-dark text-white' : ''} border-0 shadow-sm`}
                style={{
                  borderRadius: '20px',
                  padding: '8px 15px',
                  boxShadow: theme === 'dark' ? '0 2px 5px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3 d-flex align-items-center">
              <FaCalendarAlt className="me-2" style={{ color: theme === 'dark' ? '#8ab4f8' : '#0d6efd' }} />
              <Form.Label className="me-3 mb-0" style={{ minWidth: '85px' }}>Thời gian:</Form.Label>
              <Form.Select 
                value={dateRange}
                onChange={handleRangeChange}
                className={`${theme === 'dark' ? 'bg-dark text-white' : ''} border-0 shadow-sm`}
                style={{
                  borderRadius: '20px',
                  padding: '8px 15px',
                  boxShadow: theme === 'dark' ? '0 2px 5px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="year">12 tháng qua</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </FilterCard>
      
      {loading ? (
        <div className="text-center my-5 py-5">
          <Spinner animation="border" variant={theme === 'dark' ? 'light' : 'primary'} />
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="my-4 shadow-sm" style={{ borderRadius: '10px' }}>
          <div className="d-flex align-items-center">
            <span className="me-2">⚠️</span>
            <span>{error}</span>
          </div>
        </Alert>
      ) : chartData ? (
        <>
          {/* Overall Stats Cards */}
          {chartData.overallStats && (
            <>
              <div className="d-flex align-items-center mb-3">
                <div style={{ 
                  width: '5px',
                  height: '20px',
                  backgroundColor: theme === 'dark' ? '#8ab4f8' : '#0d6efd',
                  marginRight: '10px',
                  borderRadius: '5px'
                }}></div>
                <h4 className="mb-0">Thống kê tổng quan {chartData.subjectName ? `- ${chartData.subjectName}` : ''}</h4>
              </div>
              
              <Row className="mb-4 g-3">
                <Col md={3} sm={6}>
                  <StatsCard 
                    icon={FaUserGraduate} 
                    title="Tổng số lượt thi" 
                    value={chartData.overallStats.totalAttempts}
                    theme={theme}
                    color="#0d6efd"
                  />
                </Col>
                <Col md={3} sm={6}>
                  <StatsCard 
                    icon={FaMedal} 
                    title="Điểm trung bình" 
                    value={chartData.overallStats.averageScore.toFixed(2)}
                    theme={theme}
                    color="#20c997"
                  />
                </Col>
                <Col md={3} sm={6}>
                  <StatsCard 
                    icon={FaClock} 
                    title="Thời gian TB (giờ)" 
                    value={chartData.overallStats.averageTime.toFixed(2)}
                    theme={theme}
                    color="#9932cc"
                  />
                </Col>
                <Col md={3} sm={6}>
                  <StatsCard 
                    icon={FaPercentage} 
                    title="Tỉ lệ đạt" 
                    value={`${chartData.overallStats.passRate.toFixed(1)}%`}
                    theme={theme}
                    color="#fd7e14"
                  />
                </Col>
              </Row>
            </>
          )}

          {/* Score Chart */}
          <ChartCard 
            title="Phân bố điểm theo thời gian"
            icon={FaChartLine}
            theme={theme}
          >
            {chartData.scoreChartData && chartData.scoreChartData.length > 0 ? (
              <div style={{ height: '350px' }}>
                <Line options={scoreChartOptions} data={prepareScoreChartData()} />
              </div>
            ) : (
              <Alert variant="info" className="my-3 text-center">
                Không có dữ liệu điểm số trong khoảng thời gian đã chọn
              </Alert>
            )}
          </ChartCard>
          
          {/* Time Chart */}
          <ChartCard 
            title="Thời gian làm bài trung bình (giờ)"
            icon={FaClock}
            theme={theme}
          >
            {chartData.timeChartData && chartData.timeChartData.length > 0 ? (
              <div style={{ height: '350px' }}>
                <Bar options={timeChartOptions} data={prepareTimeChartData()} />
              </div>
            ) : (
              <Alert variant="info" className="my-3 text-center">
                Không có dữ liệu thời gian làm bài trong khoảng thời gian đã chọn
              </Alert>
            )}
          </ChartCard>
          
          {/* Attempt Chart */}
          <ChartCard 
            title="Số lượt làm bài theo ngày"
            icon={FaChartBar}
            theme={theme}
          >
            {chartData.attemptChartData && chartData.attemptChartData.length > 0 ? (
              <div style={{ height: '350px' }}>
                <Bar options={attemptChartOptions} data={prepareAttemptChartData()} />
              </div>
            ) : (
              <Alert variant="info" className="my-3 text-center">
                Không có dữ liệu số lượt làm bài trong khoảng thời gian đã chọn
              </Alert>
            )}
          </ChartCard>
        </>
      ) : (
        <Alert variant="info" className="my-4 shadow-sm text-center py-4" style={{ borderRadius: '10px' }}>
          <div className="d-flex flex-column align-items-center">
            <FaBook size={40} className="mb-3" style={{ opacity: 0.7 }} />
            <p className="mb-0">Vui lòng chọn môn học để xem biểu đồ phân tích</p>
          </div>
        </Alert>
      )}
    </Container>
  );
};

export default AnalyticsCharts;