import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ExamListModal = ({ show, handleClose, subject }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (show && subject) {
      fetchExams();
    }
  }, [show, subject]);

  const fetchExams = async () => {
    // This is a placeholder for the actual API call
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data
      const mockExams = [
        { id: 1, title: `Đề thi ${subject?.name} 2023 - Đề số 1`, time: 60, questions: 40, difficulty: 'Trung bình' },
        { id: 2, title: `Đề thi ${subject?.name} 2023 - Đề số 2`, time: 60, questions: 40, difficulty: 'Khó' },
        { id: 3, title: `Đề thi ${subject?.name} 2022 - Đề số 1`, time: 50, questions: 35, difficulty: 'Dễ' },
        { id: 4, title: `Đề thi ${subject?.name} 2022 - Đề số 2`, time: 50, questions: 35, difficulty: 'Trung bình' },
        { id: 5, title: `Đề thi thử ${subject?.name} 2023`, time: 60, questions: 40, difficulty: 'Khó' },
      ];
      
      setExams(mockExams);
    } catch (err) {
      setError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{subject?.name ? `Đề thi môn ${subject.name}` : 'Danh sách đề thi'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Tìm kiếm đề thi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Đang tải danh sách đề thi...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <Alert variant="info">
            Không tìm thấy đề thi phù hợp. Vui lòng thử lại với từ khóa khác.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Tên đề thi</th>
                  <th>Thời gian</th>
                  <th>Số câu</th>
                  <th>Độ khó</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map(exam => (
                  <tr key={exam.id}>
                    <td>{exam.title}</td>
                    <td>{exam.time} phút</td>
                    <td>{exam.questions} câu</td>
                    <td>{exam.difficulty}</td>
                    <td>
                      <Link to={`/exam/${exam.id}`}>
                        <Button size="sm" variant="primary">Vào thi</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExamListModal;
