import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getStudentRankings } from '../../services/analyticsService';
import { getAllSubjectsNoPaging } from '../../services/subjectService';
import { showErrorToast } from '../../utils/toastUtils';
import { FaMedal, FaFilter, FaChartLine, FaTrophy, FaUserGraduate } from 'react-icons/fa';
import styled from 'styled-components';

// Styled components for enhanced visuals
const PageHeader = styled.div`
  margin-bottom: 2rem;
  border-bottom: ${props => props.theme === 'dark' ? '1px solid #2d3748' : '1px solid #e2e8f0'};
  padding-bottom: 1rem;
`;

const PageTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PageSubtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1.1rem;
  margin-bottom: 0;
`;

const FilterCard = styled(Card)`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
    : '0 4px 6px rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 8px 15px rgba(0, 0, 0, 0.4)' 
      : '0 8px 15px rgba(0, 0, 0, 0.1)'};
  }
`;

const FilterCardHeader = styled(Card.Header)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f8fafc'};
  padding: 1rem 1.5rem;
  border-bottom: ${props => props.theme === 'dark' ? '1px solid #4a5568' : '1px solid #e2e8f0'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const RankingsCard = styled(Card)`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
    : '0 4px 6px rgba(0, 0, 0, 0.1)'};
`;

const StyledTable = styled(Table)`
  margin-bottom: 0;
  
  thead th {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    padding: 1rem 1.5rem;
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f8fafc'};
  }
  
  tbody td {
    vertical-align: middle;
    padding: 1rem 1.5rem;
  }
`;

const RankCell = styled.td`
  font-weight: 700;
  font-size: 1.1rem;
  text-align: center;
`;

const MedalBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  margin-right: 0.5rem;
  background-color: ${props => {
    if (props.rank === 1) return '#FFD700'; // Gold
    if (props.rank === 2) return '#C0C0C0'; // Silver
    if (props.rank === 3) return '#CD7F32'; // Bronze
    return props.theme === 'dark' ? '#4a5568' : '#e2e8f0'; // Others
  }};
`;

const StudentName = styled.div`
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const ScoreCell = styled.td`
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
`;

const ExamCountBadge = styled(Badge)`
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const StudentRankings = () => {
  const { theme } = useSelector(state => state.ui);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({
    subjectId: '',
    limit: 50
  });
  
  // Fetch subjects when component mounts
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsData = await getAllSubjectsNoPaging();
        setSubjects(subjectsData);
        
        // If subjects are available, select the first one by default
        if (subjectsData.length > 0) {
          setFilters(prev => ({
            ...prev,
            subjectId: subjectsData[0].id.toString()
          }));
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        showErrorToast('Không thể tải danh sách môn học');
      }
    };
    
    fetchSubjects();
  }, []);

  // Fetch rankings when subjectId changes
  useEffect(() => {
    if (filters.subjectId) {
      fetchRankings();
    }
  }, [filters.subjectId, filters.limit]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      // Only include subjectId in params if it has a value
      const params = { limit: filters.limit };
      if (filters.subjectId) {
        params.subjectId = filters.subjectId;
      }
      
      const response = await getStudentRankings(params);
      
      // Handle the specific API response format from /analytics/rank
      if (response && response.success && response.data && Array.isArray(response.data.rankings)) {
        // Use the rankings array from the new API format
        const mappedRankings = response.data.rankings.map(student => ({
          id: student.userId,
          name: student.fullName,
          className: student.className || 'N/A', // API may not include className
          averageScore: student.averageScore,
          totalExams: student.examCount,
          rank: student.rank,
          // Additional data from the API that might be useful
          highestScore: student.highestScore,
          averagePercentage: student.averagePercentage
        }));
        setRankings(mappedRankings);
      } else {
        console.warn('Unexpected rankings data format:', response);
        setRankings([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching student rankings:', err);
      setError('Không thể tải dữ liệu xếp hạng. Vui lòng thử lại sau.');
      showErrorToast('Có lỗi khi tải dữ liệu xếp hạng');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Helper function to determine medal icon
  const getMedalIcon = (rank) => {
    if (rank === 1) return <FaMedal size={20} />;
    if (rank === 2) return <FaMedal size={20} />;
    if (rank === 3) return <FaMedal size={20} />;
    return rank;
  };

  // Get current subject name
  const currentSubject = subjects.find(subject => subject.id.toString() === filters.subjectId?.toString())?.name || '';

  return (
    <Container className="py-4">
      <PageHeader theme={theme}>
        <PageTitle theme={theme}>
          <FaTrophy /> Bảng Xếp Hạng Học Sinh
        </PageTitle>
        <PageSubtitle theme={theme}>
          Thành tích học tập và xếp hạng của học sinh theo môn học
        </PageSubtitle>
      </PageHeader>
      
      <FilterCard bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4" theme={theme}>
        <FilterCardHeader theme={theme}>
          <FaFilter />
          <h5 className="mb-0">Bộ Lọc Xếp Hạng</h5>
        </FilterCardHeader>
        <Card.Body>
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
                  {subjects.length === 0 ? (
                    <option disabled>Đang tải danh sách môn học...</option>
                  ) : (
                    subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Số lượng hiển thị</Form.Label>
                <Form.Select
                  name="limit"
                  value={filters.limit}
                  onChange={handleFilterChange}
                  className={theme === 'dark' ? 'bg-dark text-white' : ''}
                >
                  <option value="10">10 học sinh</option>
                  <option value="25">25 học sinh</option>
                  <option value="50">50 học sinh</option>
                  <option value="100">100 học sinh</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </FilterCard>
      
      {loading ? (
        <LoadingContainer>
          <Spinner animation="border" variant="primary" />
          <LoadingText theme={theme}>Đang tải dữ liệu xếp hạng...</LoadingText>
        </LoadingContainer>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <RankingsCard bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} theme={theme}>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <FaChartLine className="me-2" /> 
                {currentSubject ? `Xếp hạng: ${currentSubject}` : 'Xếp hạng học sinh'}
              </h5>
              <Badge bg="info">Tổng số: {rankings.length} học sinh</Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <StyledTable responsive striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'} theme={theme}>
              <thead>
                <tr>
                  <th style={{width: '10%'}}>Thứ hạng</th>
                  <th style={{width: '40%'}}>Học sinh</th>
                  <th style={{width: '25%'}}>Điểm trung bình</th>
                  <th style={{width: '25%'}}>Số bài thi</th>
                </tr>
              </thead>
              <tbody>
                {rankings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="d-flex flex-column align-items-center">
                        <FaUserGraduate size={40} className="mb-3 text-muted" />
                        <h5>Không có dữ liệu xếp hạng</h5>
                        <p className="text-muted mb-0">Chưa có học sinh hoàn thành bài thi cho môn học này</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rankings.map((student) => (
                    <tr key={student.id}>
                      <RankCell>
                        {student.rank <= 3 ? (
                          <MedalBadge rank={student.rank} theme={theme}>
                            {getMedalIcon(student.rank)}
                          </MedalBadge>
                        ) : (
                          student.rank
                        )}
                      </RankCell>
                      <td>
                        <StudentName>
                          <FaUserGraduate className="me-2" />
                          {student.name}
                        </StudentName>
                      </td>
                      <ScoreCell theme={theme}>
                        {student.averageScore.toFixed(2)} 
                        <small className="ms-2 text-muted">({student.averagePercentage}%)</small>
                      </ScoreCell>
                      <td>
                        <ExamCountBadge bg={student.totalExams > 3 ? 'success' : 'secondary'}>
                          {student.totalExams} bài thi
                        </ExamCountBadge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </StyledTable>
          </Card.Body>
        </RankingsCard>
      )}
    </Container>
  );
};

export default StudentRankings;