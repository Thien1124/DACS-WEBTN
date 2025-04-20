import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const TeacherEditExam = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    duration: 45,
    passingScore: 5,
    isPublic: true,
    isActive: true,
    questionCount: 20
  });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useSelector(state => state.ui);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };

        // Fetch exam data and subjects in parallel
        const [examRes, subjectsRes] = await Promise.all([
          axios.get(`${API_URL}/api/Exams/${id}`, config),
          axios.get(`${API_URL}/api/Subjects`, config)
        ]);

        setFormData({
          title: examRes.data.title,
          description: examRes.data.description || '',
          subjectId: examRes.data.subjectId,
          duration: examRes.data.duration,
          passingScore: examRes.data.passingScore,
          isPublic: examRes.data.isPublic,
          isActive: examRes.data.isActive,
          questionCount: examRes.data.questionCount
        });

        setSubjects(subjectsRes.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải thông tin đề thi. Vui lòng thử lại sau.');
        console.error('Error fetching exam data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/Exams/${id}`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      navigate('/teacher/exams');
    } catch (err) {
      setError('Không thể cập nhật đề thi. Vui lòng thử lại sau.');
      console.error('Error updating exam:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Chỉnh sửa đề thi</h2>
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tiêu đề</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Môn học</Form.Label>
                  <Form.Select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn môn học</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </Form.Group>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian làm bài (phút)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Điểm đạt</Form.Label>
                  <Form.Control
                    type="number"
                    name="passingScore"
                    value={formData.passingScore}
                    onChange={handleChange}
                    min="0"
                    max="10"
                    step="0.1"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Số câu hỏi</Form.Label>
                  <Form.Control
                    type="number"
                    name="questionCount"
                    value={formData.questionCount}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isPublic"
                    label="Công khai"
                    checked={formData.isPublic}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              
              <Col>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isActive"
                    label="Kích hoạt"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                className="me-2" 
                onClick={() => navigate('/teacher/exams')}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={submitting}
              >
                {submitting ? 'Đang lưu...' : 'Cập nhật đề thi'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TeacherEditExam;