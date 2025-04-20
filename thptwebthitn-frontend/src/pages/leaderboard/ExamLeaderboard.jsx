import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useSelector } from 'react-redux';
import Leaderboard from '../../components/leaderboard/Leaderboard';

const ExamLeaderboard = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get the auth token
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
        
        // Fetch exam details and leaderboard in parallel
        const [examRes, leaderboardRes] = await Promise.all([
          axios.get(`${API_URL}/api/Exams/${examId}`, config),
          axios.get(`${API_URL}/api/ExamResults/leaderboard/${examId}`, config)
        ]);
        
        setExam(examRes.data);
        setLeaderboard(leaderboardRes.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải bảng xếp hạng. Vui lòng thử lại sau.');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [examId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!exam) return <Alert variant="warning">Không tìm thấy đề thi.</Alert>;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Bảng xếp hạng</h2>
          <p className="text-muted">{exam.title}</p>
        </div>
        <Button variant="outline-primary" onClick={() => navigate(`/exams/${examId}`)}>
          <FaArrowLeft className="me-2" /> Quay lại đề thi
        </Button>
      </div>
      
      <Card className="mb-4 shadow-sm" bg={theme === 'dark' ? 'dark' : 'light'}>
        <Card.Body>
          <div className="d-flex align-items-center">
            <div className="display-4 me-3 text-warning">
              <FaTrophy />
            </div>
            <div>
              <h4 className="mb-1">Top 10 điểm cao nhất</h4>
              <p className="text-muted mb-0">
                Môn học: {exam.subject?.name} | Thời gian: {exam.duration} phút | Số câu hỏi: {exam.questionCount}
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      <Leaderboard 
        title="Bảng xếp hạng" 
        leaders={leaderboard} 
        currentUserId={user?.id} 
      />
      
      <div className="mt-3 text-center text-muted">
        <small>Bảng xếp hạng được cập nhật sau mỗi lần thi hoàn thành</small>
      </div>
    </Container>
  );
};

export default ExamLeaderboard;