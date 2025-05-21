import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { createClassroom } from '../../services/classroomService';

const ClassroomCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '10',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === 'Admin';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên lớp không được để trống';
    } else if (!/^[0-9]{1,2}[A-Z][0-9]{0,2}$/.test(formData.name.trim())) {
      newErrors.name = 'Tên lớp phải theo định dạng [Khối][Chữ cái][Số]. Ví dụ: 10A1, 11B2';
    }
    
    if (!formData.grade) {
      newErrors.grade = 'Vui lòng chọn khối';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      await createClassroom(formData);
      
      // Redirect back to classrooms list
      navigate(`/${isAdmin ? 'admin' : 'teacher'}/classrooms`);
    } catch (err) {
      console.error('Error creating classroom:', err);
      setError('Không thể tạo lớp học. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${isAdmin ? 'admin' : 'teacher'}/classrooms`);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Thêm lớp học mới</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên lớp</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                placeholder="Nhập tên lớp (Ví dụ: 10A1)"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
              <Form.Text muted>
                Tên lớp phải theo định dạng [Khối][Chữ cái][Số]. Ví dụ: 10A1, 11B2
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Khối</Form.Label>
              <Form.Select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                isInvalid={!!errors.grade}
              >
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.grade}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả lớp học (không bắt buộc)"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCancel} disabled={submitting}>
                <FaTimes /> Hủy
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                <FaSave /> {submitting ? 'Đang lưu...' : 'Lưu lớp học'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ClassroomCreate;