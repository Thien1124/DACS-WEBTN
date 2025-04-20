import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { FaUsers, FaFileAlt, FaPencilAlt, FaBookOpen } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { API_URL } from '../../config/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import styled from 'styled-components';

const StatCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-left: 4px solid ${props => props.color || '#4e73df'};
  border-radius: 0.35rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  padding: 1.25rem;
  margin-bottom: 1rem;
  
  .title {
    text-transform: uppercase;
    color: ${props => props.color || '#4e73df'};
    font-size: 0.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .value {
    color: ${props => props.theme === 'dark' ? '#ffffff' : '#5a5c69'};
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0;
  }
  
  .icon {
    color: ${props => props.theme === 'dark' ? '#4a4a4a' : '#dddfeb'};
    font-size: 2rem;
  }
`;

const AdminStatistics = () => {
  const [overview, setOverview] = useState(null);
  const [subjectStats, setSubjectStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useSelector(state => state.ui);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const [overviewRes, subjectStatsRes] = await Promise.all([
          axios.get(`${API_URL}/api/Statistics/overview`),
          axios.get(`${API_URL}/api/Statistics/by-subject`)
        ]);
        
        setOverview(overviewRes.data);
        setSubjectStats(subjectStatsRes.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <Container className="mt-4 mb-5">
      <h2 className="text-center mb-4">Thống Kê Hệ Thống</h2>
      
      <Row>
        <Col lg={3} md={6} sm={12} className="mb-4">
          <StatCard theme={theme} color="#4e73df">
            <div className="d-flex justify-content-between">
              <div>
                <div className="title">Tổng người dùng</div>
                <div className="value">{overview?.users?.total || 0}</div>
              </div>
              <div className="icon">
                <FaUsers />
              </div>
            </div>
          </StatCard>
        </Col>
        
        <Col lg={3} md={6} sm={12} className="mb-4">
          <StatCard theme={theme} color="#1cc88a">
            <div className="d-flex justify-content-between">
              <div>
                <div className="title">Số đề thi</div>
                <div className="value">{overview?.exams?.total || 0}</div>
              </div>
              <div className="icon">
                <FaFileAlt />
              </div>
            </div>
          </StatCard>
        </Col>
        
        <Col lg={3} md={6} sm={12} className="mb-4">
          <StatCard theme={theme} color="#36b9cc">
            <div className="d-flex justify-content-between">
              <div>
                <div className="title">Lượt thi</div>
                <div className="value">{overview?.examResults?.total || 0}</div>
              </div>
              <div className="icon">
                <FaPencilAlt />
              </div>
            </div>
          </StatCard>
        </Col>
        
        <Col lg={3} md={6} sm={12} className="mb-4">
          <StatCard theme={theme} color="#f6c23e">
            <div className="d-flex justify-content-between">
              <div>
                <div className="title">Môn học</div>
                <div className="value">{overview?.subjects || 0}</div>
              </div>
              <div className="icon">
                <FaBookOpen />
              </div>
            </div>
          </StatCard>
        </Col>
      </Row>
      
      <Card className="shadow mb-4" bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Header className="bg-primary text-white py-3">
          <h6 className="m-0 font-weight-bold">Chi tiết theo môn học</h6>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-bordered" style={{color: theme === 'dark' ? 'white' : 'inherit'}}>
              <thead>
                <tr>
                  <th>Môn học</th>
                  <th>Mã môn</th>
                  <th>Số đề thi</th>
                  <th>Lượt thi</th>
                  <th>Điểm trung bình</th>
                </tr>
              </thead>
              <tbody>
                {subjectStats.map(stat => (
                  <tr key={stat.subject.id}>
                    <td>{stat.subject.name}</td>
                    <td>{stat.subject.code}</td>
                    <td>{stat.examCount}</td>
                    <td>{stat.attemptCount}</td>
                    <td>{stat.averageScore.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminStatistics;