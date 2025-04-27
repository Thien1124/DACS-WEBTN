import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

const PracticeExam = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [practiceParams, setPracticeParams] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const encodedParams = params.get('params');
    
    if (encodedParams) {
      try {
        const decodedParams = JSON.parse(atob(encodedParams));
        setPracticeParams(decodedParams);
      } catch (e) {
        setError('Không thể đọc tham số đề luyện tập');
      }
    } else {
      setError('Không tìm thấy tham số đề luyện tập');
    }
    
    // Simulate loading practice exam data
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, [location]);

  const getSubjectName = (subjectId) => {
    for (const grade of [10, 11, 12]) {
      const subjects = grades.find(g => g.id === grade)?.subjects || [];
      const subject = subjects.find(s => s.id === subjectId);
      if (subject) return subject.name;
    }
    return `Môn học (ID: ${subjectId})`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3" />
            <h4>Đang tải đề luyện tập...</h4>
          </div>
        </Container>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container className="mt-5 mb-5">
          <Alert variant="danger">{error}</Alert>
          <Button variant="primary" href="/practice">Quay lại trang luyện tập</Button>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="py-5">
        <Card className="mb-4">
          <Card.Body>
            <h2 className="mb-4">Đề luyện tập</h2>
            
            <div className="mb-4">
              <h5>Thông tin đề luyện tập:</h5>
              <p><strong>Khối lớp:</strong> {practiceParams?.gradeLevel}</p>
              <p><strong>Môn học:</strong> {getSubjectName(practiceParams?.subjectId)}</p>
              <p><strong>Số lượng câu hỏi:</strong> {practiceParams?.questionCount}</p>
              <p><strong>Độ khó:</strong> {
                practiceParams?.difficulty === 'easy' ? 'Dễ' :
                practiceParams?.difficulty === 'medium' ? 'Trung bình' :
                practiceParams?.difficulty === 'hard' ? 'Khó' : 'Siêu Khó'
              }</p>
            </div>
            
            <Alert variant="info">
              Tính năng này đang được phát triển. Đề luyện tập sẽ được hiển thị tại đây.
            </Alert>
            
            <Button variant="primary" href="/practice">Quay lại trang luyện tập</Button>
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </>
  );
};

const grades = [
  {
    id: 10,
    name: 'Lớp 10',
    subjects: [
      { id: 1, name: 'Toán 10' },
      { id: 2, name: 'Vật Lý 10' },
      { id: 3, name: 'Hóa Học 10' },
      { id: 10, name: 'Sinh Học 10' },
      { id: 13, name: 'Ngữ Văn 10' },
      { id: 16, name: 'Tiếng Anh 10' },
      { id: 19, name: 'Lịch Sử 10' },
      { id: 22, name: 'Địa Lý 10' },
      { id: 25, name: 'GDKT&PL 10' }
    ]
  },
  {
    id: 11,
    name: 'Lớp 11',
    subjects: [
      { id: 4, name: 'Toán 11' },
      { id: 5, name: 'Vật Lý 11' },
      { id: 6, name: 'Hóa Học 11' },
      { id: 11, name: 'Sinh Học 11' },
      { id: 14, name: 'Ngữ Văn 11' },
      { id: 17, name: 'Tiếng Anh 11' },
      { id: 20, name: 'Lịch Sử 11' },
      { id: 23, name: 'Địa Lý 11' },
      { id: 26, name: 'GDKT&PL 11' }
    ]
  },
  {
    id: 12,
    name: 'Lớp 12',
    subjects: [
      { id: 7, name: 'Toán 12' },
      { id: 8, name: 'Vật Lý 12' },
      { id: 9, name: 'Hóa Học 12' },
      { id: 12, name: 'Sinh Học 12' },
      { id: 15, name: 'Ngữ Văn 12' },
      { id: 18, name: 'Tiếng Anh 12' },
      { id: 21, name: 'Lịch Sử 12' },
      { id: 24, name: 'Địa Lý 12' },
      { id: 27, name: 'GDKT&PL 12' }
    ]
  }
];

export default PracticeExam;