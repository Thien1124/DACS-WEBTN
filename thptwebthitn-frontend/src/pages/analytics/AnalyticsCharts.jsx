import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Line, Bar } from 'react-chartjs-2';
import { getChartData } from '../../services/analyticsService';
import { showErrorToast } from '../../utils/toastUtils';

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

const AnalyticsCharts = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
  const { theme } = useSelector(state => state.ui);
  
  useEffect(() => {
    fetchChartData();
  }, [dateRange]);
  
  const fetchChartData = async () => {
    setLoading(true);
    try {
      const data = await getChartData({ period: dateRange });
      setChartData(data);
      setError(null);
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
  
  // Prepare chart options and data
  const scoreChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Phân bố điểm theo thời gian',
        color: theme === 'dark' ? '#fff' : '#333',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10
      }
    }
  };
  
  const timeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Thời gian làm bài trung bình',
        color: theme === 'dark' ? '#fff' : '#333',
      },
    },
  };
  
  const prepareScoreChartData = () => {
    if (!chartData || !chartData.scores) return null;
    
    return {
      labels: chartData.scores.map(item => item.date),
      datasets: [
        {
          label: 'Điểm trung bình',
          data: chartData.scores.map(item => item.averageScore),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Điểm cao nhất',
          data: chartData.scores.map(item => item.highestScore),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: 'Điểm thấp nhất',
          data: chartData.scores.map(item => item.lowestScore),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ],
    };
  };
  
  const prepareTimeChartData = () => {
    if (!chartData || !chartData.times) return null;
    
    return {
      labels: chartData.times.map(item => item.date),
      datasets: [
        {
          label: 'Thời gian trung bình (phút)',
          data: chartData.times.map(item => item.averageTime / 60), // Convert seconds to minutes
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
          borderColor: theme === 'dark' ? '#fff' : '#333',
          borderWidth: 1
        }
      ],
    };
  };
  
  return (
    <Container className="my-4">
      <h2 className="mb-4">Biểu Đồ Phân Tích Bài Thi</h2>
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label>Phạm vi thời gian</Form.Label>
            <Form.Select 
              value={dateRange}
              onChange={handleRangeChange}
              className={theme === 'dark' ? 'bg-dark text-white' : ''}
            >
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="year">12 tháng qua</option>
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Row className="mb-4">
            <Col lg={12}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                <Card.Body>
                  <Card.Title>Biểu Đồ Điểm Số</Card.Title>
                  {chartData && chartData.scores ? (
                    <Line options={scoreChartOptions} data={prepareScoreChartData()} />
                  ) : (
                    <Alert variant="info">Không có dữ liệu điểm số</Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col lg={12}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                <Card.Body>
                  <Card.Title>Biểu Đồ Thời Gian Làm Bài</Card.Title>
                  {chartData && chartData.times ? (
                    <Bar options={timeChartOptions} data={prepareTimeChartData()} />
                  ) : (
                    <Alert variant="info">Không có dữ liệu thời gian làm bài</Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default AnalyticsCharts;