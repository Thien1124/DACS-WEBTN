import React from 'react';
import { Table, Card, Badge } from 'react-bootstrap';
import { FaTrophy, FaMedal, FaCertificate, FaClock, FaCalendarAlt } from 'react-icons/fa';

const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return <FaTrophy className="text-warning" />;
    case 2:
      return <FaMedal className="text-secondary" />;
    case 3:
      return <FaMedal className="text-danger" />;
    default:
      return <FaCertificate className="text-info" />;
  }
};

const getScoreColor = (score) => {
  if (score >= 9.5) return 'danger';
  if (score >= 8.0) return 'success';
  if (score >= 7.0) return 'primary';
  if (score >= 5.0) return 'warning';
  return 'secondary';
};

const TopStudentsLeaderboard = ({ title, students, currentUserId, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu bảng xếp hạng...</p>
        </Card.Body>
      </Card>
    );
  }
  
  if (!students || students.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center py-5">
          <div className="h1 mb-3">📊</div>
          <h5>Chưa có dữ liệu bảng xếp hạng</h5>
          <p className="text-muted">Hãy hoàn thành bài thi để xuất hiện trong bảng xếp hạng.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h5 className="m-0">{title || 'Top 10 học sinh có điểm cao nhất'}</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover striped className="m-0">
          <thead>
            <tr className="text-center">
              <th style={{ width: '10%' }}>Hạng</th>
              <th style={{ width: '35%' }} className="text-start">Học sinh</th>
              <th style={{ width: '15%' }}>Lớp</th>
              <th style={{ width: '15%' }}>Điểm số</th>
              <th style={{ width: '15%' }}>Thời gian</th>
              <th style={{ width: '10%' }}>Ngày thi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr 
                key={student.rank} 
                className={`text-center ${currentUserId && student.userId === currentUserId ? 'table-active' : ''}`}
              >
                <td>
                  <div className="d-flex align-items-center justify-content-center">
                    {getRankIcon(student.rank)}
                    <span className="ms-2">{student.rank}</span>
                  </div>
                </td>
                <td className="text-start">
                  {student.fullName}
                  {currentUserId && student.userId === currentUserId && 
                    <Badge bg="info" className="ms-2">Bạn</Badge>
                  }
                </td>
                <td>{student.className}</td>
                <td>
                  <Badge bg={getScoreColor(student.score)} style={{ fontSize: '0.9em' }}>
                    {student.score.toFixed(1)}/10
                  </Badge>
                </td>
                <td>
                  <FaClock className="me-1" />
                  {student.completionTime}
                </td>
                <td>
                  <FaCalendarAlt className="me-1" />
                  {student.completedDate.split('-').slice(1).reverse().join('/')}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default TopStudentsLeaderboard;