import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Spinner, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getStudentRankings } from '../../services/analyticsService';
import { getAllSubjectsNoPaging } from '../../services/subjectService';
import { showErrorToast } from '../../utils/toastUtils';

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
      
      // Check the response format and extract the array
      if (Array.isArray(response)) {
        setRankings(response);
      } else if (response && Array.isArray(response.data)) {
        setRankings(response.data);
      } else if (response && Array.isArray(response.items)) {
        setRankings(response.items);
      } else {
        console.warn('Unexpected rankings data format:', response);
        setRankings([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching student rankings:', err);
      setError('Không thể tải dữ liệu xếp hạng. Vui lòng thử lại sau.');
      showErrorToast('Có lỗi khi tải dữ liệu xếp hạng');
      // Ensure rankings is an empty array when there's an error
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">Bảng xếp hạng học sinh</h2>
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4">
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
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
          <Card.Body>
            <Table responsive striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
              <thead>
                <tr>
                  <th>Thứ hạng</th>
                  <th>Học sinh</th>
                  <th>Lớp</th>
                  <th>Điểm trung bình</th>
                  <th>Số bài thi</th>
                </tr>
              </thead>
              <tbody>
                {rankings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">Không có dữ liệu xếp hạng</td>
                  </tr>
                ) : (
                  rankings.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>{student.name}</td>
                      <td>{student.className}</td>
                      <td>{student.averageScore.toFixed(2)}</td>
                      <td>{student.totalExams}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default StudentRankings;