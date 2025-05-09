import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useSelector } from 'react-redux';
import Leaderboard from '../../components/leaderboard/Leaderboard';

const ExamLeaderboard = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardSummary, setLeaderboardSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy token xác thực
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
        
        // Kiểm tra ID đề thi
        if (!examId) {
          setError('Không tìm thấy ID đề thi');
          setLoading(false);
          return;
        }
        
        console.log('Đang tải bảng xếp hạng cho đề thi ID:', examId);
        
        // Tải trực tiếp dữ liệu bảng xếp hạng mà không cần tải thông tin đề thi trước
        try {
          // Thử tải bảng xếp hạng trước
          const leaderboardRes = await axios.get(`${API_URL}/api/Leaderboard/${examId}`, config);
          console.log('Dữ liệu bảng xếp hạng:', leaderboardRes.data);
          
          if (leaderboardRes.data) {
            // Lấy thông tin đề thi từ dữ liệu bảng xếp hạng nếu có
            if (leaderboardRes.data.summary) {
              setLeaderboardSummary(leaderboardRes.data.summary);
              // Tạo đối tượng đề thi cơ bản từ thông tin summary
              setExam({
                id: leaderboardRes.data.summary.examId,
                title: leaderboardRes.data.summary.examTitle
              });
            }
            
            // Lưu dữ liệu bảng xếp hạng
            if (leaderboardRes.data.leaderboard) {
              setLeaderboard(leaderboardRes.data.leaderboard);
            } else if (Array.isArray(leaderboardRes.data)) {
              setLeaderboard(leaderboardRes.data);
            } else {
              console.warn('Định dạng dữ liệu bảng xếp hạng không như mong đợi:', leaderboardRes.data);
              setLeaderboard([]);
            }
            
            // Bây giờ thử lấy thêm thông tin chi tiết về đề thi nếu cần
            try {
              const examRes = await axios.get(`${API_URL}/api/Exams/${examId}`, config);
              setExam(examRes.data);
            } catch (examErr) {
              console.log('Không thể tải thông tin chi tiết đề thi, nhưng vẫn có bảng xếp hạng');
              // Không cần setError vì chúng ta đã có thông tin cơ bản từ bảng xếp hạng
            }
          }
        } catch (leaderboardErr) {
          console.error('Lỗi khi tải bảng xếp hạng:', leaderboardErr);
          
          // Nếu không tải được bảng xếp hạng, thử tải ít nhất thông tin đề thi
          try {
            const examRes = await axios.get(`${API_URL}/api/Exams/${examId}`, config);
            setExam(examRes.data);
            setLeaderboard([]);  // Không có bảng xếp hạng
          } catch (examErr) {
            console.error('Không thể tải thông tin đề thi:', examErr);
            setError('Không thể tải thông tin đề thi. Đề thi có thể đã bị xóa hoặc bạn không có quyền truy cập.');
          }
        }
      } catch (err) {
        console.error('Lỗi chung:', err);
        setError(`Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [examId]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải bảng xếp hạng...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Bảng xếp hạng</h2>
          {exam && <p className="text-muted">{exam.title}</p>}
        </div>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" /> Quay lại
        </Button>
      </div>
      
      {error && <Alert variant="warning" className="mb-4">{error}</Alert>}
      
      {!error && (
        <>
          {exam && (
            <Card className="mb-4 shadow-sm" bg={theme === 'dark' ? 'dark' : 'light'}>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="display-4 me-3 text-warning">
                    <FaTrophy />
                  </div>
                  <div>
                    <h4 className="mb-1">Top điểm cao nhất</h4>
                    <p className="text-muted mb-0">
                      {exam.title}
                    </p>
                    {leaderboardSummary && (
                      <p className="mt-2 text-info">
                        Tổng số người tham gia: {leaderboardSummary.totalParticipants} | 
                        Điểm trung bình: {leaderboardSummary.averageScore}
                      </p>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
          
          {leaderboard.length > 0 ? (
            <Leaderboard 
              title="Bảng xếp hạng" 
              leaders={leaderboard} 
              currentUserId={user?.id} 
            />
          ) : (
            <Alert variant="info">
              Chưa có người tham gia thi cho đề thi này hoặc bảng xếp hạng chưa được cập nhật.
            </Alert>
          )}
          
          <div className="mt-3 text-center text-muted">
            <small>Bảng xếp hạng được cập nhật sau mỗi lần thi hoàn thành</small>
            {leaderboardSummary && leaderboardSummary.lastUpdated && (
              <p className="mt-1">
                <small>Cập nhật lần cuối: {new Date(leaderboardSummary.lastUpdated).toLocaleString('vi-VN')}</small>
              </p>
            )}
          </div>
        </>
      )}
    </Container>
  );
};

export default ExamLeaderboard;