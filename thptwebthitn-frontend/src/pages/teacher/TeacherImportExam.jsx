import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useSelector } from 'react-redux';
import { FaFileExcel, FaUpload, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const TeacherImportExam = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { theme } = useSelector(state => state.ui);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(false);
  };

  const handleDownloadTemplate = () => {
    // Create template structure
    const template = [
      {
        'Tiêu đề': 'Đề thi mẫu',
        'Mô tả': 'Mô tả đề thi',
        'Mã môn học': 'MATH',
        'Thời gian (phút)': 45,
        'Điểm đạt': 5,
        'Số câu hỏi': 20,
        'Công khai': 'TRUE',
        'Kích hoạt': 'TRUE'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(template);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    // Generate file and trigger download
    XLSX.writeFile(workbook, 'mau-nhap-de-thi.xlsx');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Vui lòng chọn tệp Excel để tải lên');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/Exams/import`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      setFile(null);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/teacher/exams');
      }, 2000);
    } catch (err) {
      setError('Không thể nhập dữ liệu. Vui lòng kiểm tra định dạng tệp và thử lại.');
      console.error('Error importing exams:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Nhập đề thi từ Excel</h2>

      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Nhập dữ liệu thành công!</Alert>}

          <div className="mb-4">
            <h5>Hướng dẫn</h5>
            <p>
              1. Tải xuống tệp mẫu Excel<br />
              2. Điền thông tin đề thi theo định dạng<br />
              3. Tải lên tệp Excel đã hoàn thành
            </p>
            <Button variant="info" onClick={handleDownloadTemplate}>
              <FaDownload className="me-2" /> Tải xuống tệp mẫu
            </Button>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Chọn tệp Excel</Form.Label>
              <div className="input-group">
                <Form.Control 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                />
                <Button variant="primary" type="submit" disabled={!file || uploading}>
                  {uploading ? 'Đang tải lên...' : <><FaUpload className="me-2" /> Tải lên</>}
                </Button>
              </div>
              <Form.Text className="text-muted">
                Chỉ chấp nhận tệp Excel (.xlsx, .xls)
              </Form.Text>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      <div className="mt-3 d-flex justify-content-end">
        <Button variant="secondary" onClick={() => navigate('/teacher/exams')}>
          Quay lại
        </Button>
      </div>
    </Container>
  );
};

export default TeacherImportExam;