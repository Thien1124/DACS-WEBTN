import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import { getStudentAnalytics } from '../../services/analyticsService';
import { showErrorToast } from '../../utils/toastUtils';

import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentAnalytics = () => {
  const { studentId } = useParams();
  const { theme } = useSelector(state => state.ui);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    student: null,
    subjectAverages: [],
    recentExams: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getStudentAnalytics(studentId);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching student analytics:', error);
        setError('Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.');
        showErrorToast('Không thể tải dữ liệu phân tích');
      } finally {
        setLoading(false);
      }
    };
    
    if (studentId) {
      fetchAnalytics();
    }
  }, [studentId]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center my-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Chart data for subject averages
  const chartData = {
    labels: analytics.subjectAverages.map(item => item.subjectName),
    datasets: [
      {
        label: 'Điểm trung bình',
        data: analytics.subjectAverages.map(item => item.averageScore),
        backgroundColor: theme === 'dark' ? 'rgba(75, 192, 192, 0.7)' : 'rgba(75, 192, 192, 0.8)',
        borderColor: theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
        borderWidth: 1
      }
    ]
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">Thống kê học sinh: {analytics.student?.name}</h2>
      
      <Row className="mb-4">
        <Col md={12}>
          <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
            <Card.Header>
              <h5 className="mb-0">Điểm trung bình theo môn học</h5>
            </Card.Header>
            <Card.Body>
              <Bar 
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
            <Card.Header>
              <h5 className="mb-0">Bài thi gần đây</h5>
            </Card.Header>
            <Card.Body>
              <table className="table">
                <thead>
                  <tr>
                    <th>Môn học</th>
                    <th>Tên bài thi</th>
                    <th>Điểm số</th>
                    <th>Ngày thi</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentExams.map((exam, index) => (
                    <tr key={index}>
                      <td>{exam.subjectName}</td>
                      <td>{exam.examTitle}</td>
                      <td>{exam.score}</td>
                      <td>{new Date(exam.dateTaken).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentAnalytics;