import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getClassroomByName, updateClassroom } from '../../services/classroomService';

const ClassroomEdit = () => {
  const { name } = useParams();
  const [formData, setFormData] = useState({
    newName: '',
    grade: '',
    description: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  const userRole = user?.role;

  useEffect(() => {
    fetchClassroomData();
  }, [name]);

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClassroomByName(name);
      
      setFormData({
        newName: data.name,
        grade: data.grade,
        description: data.description || ''
      });
      
      setOriginalData(data);
    } catch (err) {
      console.error('Error fetching classroom data:', err);
      setError('Không thể tải thông tin lớp học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

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
    
    if (!formData.newName.trim()) {
      newErrors.newName = 'Tên lớp không được để trống';
    } else if (!/^[0-9]{1,2}[A-Z][0-9]{0,2}$/.test(formData.newName.trim())) {
      newErrors.newName = 'Tên lớp phải theo định dạng [Khối][Chữ cái][Số]. Ví dụ: 10A1, 11B2';
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
      
      await updateClassroom(name, formData);
      
      toast.success('Cập nhật lớp học thành công!');
      // Redirect to the detail page of the classroom (with the new name if it was changed)
      navigate(`/${userRole.toLowerCase()}/classrooms/${formData.newName !== name ? formData.newName : name}`);
    } catch (err) {
      console.error('Error updating classroom:', err);
      setError(`Không thể cập nhật lớp học. ${err.response?.data?.message || 'Vui lòng thử lại sau.'}`);
      toast.error('Cập nhật lớp học thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${userRole.toLowerCase()}/classrooms/${name}`);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleCancel}>
          <FaArrowLeft /> Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Chỉnh sửa lớp {name}</h2>
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên lớp</Form.Label>
              <Form.Control
                type="text"
                name="newName"
                value={formData.newName}
                onChange={handleChange}
                isInvalid={!!errors.newName}
                placeholder="Nhập tên lớp (Ví dụ: 10A1)"
              />
              <Form.Control.Feedback type="invalid">
                {errors.newName}
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
                <option value="">Chọn khối</option>
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
                <FaSave /> {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ClassroomEdit;