import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FaTrophy, FaArrowLeft } from 'react-icons/fa';
import TopStudentsLeaderboard from '../../components/leaderboard/TopStudentsLeaderboard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubjectById } from '../../redux/subjectSlice';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { showErrorToast } from '../../utils/toastUtils';

// Safely get auth context
let useAuth = () => ({ user: null });
try {
  const authContext = require('../../contexts/AuthContext');
  useAuth = authContext.useAuth;
} catch (err) {
  console.warn('AuthContext not available or not properly configured');
}

const SubjectTopStudentsPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get current subject from Redux store
  const { currentSubject } = useSelector(state => state.subjects || { subjects: {} });
  const { theme } = useSelector(state => state.ui);
  
  // Safely use auth if available
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (e) {
    console.warn('Auth context not available:', e.message);
  }
  
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [subjectExams, setSubjectExams] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch subject info
        if (!subjectId) {
          setError('Không tìm thấy ID môn học');
          setLoading(false);
          return;
        }

        dispatch(fetchSubjectById(subjectId));
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Bạn cần đăng nhập để xem bảng xếp hạng');
          setLoading(false);
          return;
        }
        
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
        
        console.log(`Đang tải danh sách đề thi cho môn học ID: ${subjectId}`);
        console.log(`API URL: ${API_URL}/api/Exams/bysubject/${subjectId}`);
        
        // Cách 1: Tải danh sách đề thi của môn học và sau đó tải leaderboard
        try {
          // 1. Đầu tiên, lấy danh sách các đề thi của môn học
          const examsResponse = await axios.get(`${API_URL}/api/Exams/bysubject/${subjectId}`, config);
          console.log('Danh sách đề thi (length):', examsResponse.data?.length || 0);
          
          if (examsResponse.data && Array.isArray(examsResponse.data)) {
            setSubjectExams(examsResponse.data);
            
            // Dùng Promise.all để tải tất cả leaderboard cùng lúc thay vì tuần tự
            const leaderboardPromises = examsResponse.data
              .filter(exam => exam.id) // Chỉ lấy các đề thi có ID
              .map(exam => {
                console.log(`Chuẩn bị tải leaderboard cho đề thi ID: ${exam.id}`);
                return axios.get(`${API_URL}/api/Leaderboard/${exam.id}`, config)
                  .then(res => ({
                    examId: exam.id,
                    examTitle: exam.title,
                    data: res.data
                  }))
                  .catch(err => {
                    console.log(`Không lấy được leaderboard đề thi ${exam.id}: ${err.message}`);
                    return null; // Trả về null để tiếp tục xử lý các đề thi khác
                  });
              });
            
            console.log(`Đang tải leaderboard cho ${leaderboardPromises.length} đề thi...`);
            const results = await Promise.all(leaderboardPromises);
            console.log(`Đã tải xong ${results.filter(r => r !== null).length} leaderboard`);
            
            // Lọc kết quả hợp lệ và gộp lại
            const allLeaderboardItems = [];
            results.forEach(result => {
              if (!result || !result.data || !result.data.leaderboard) return;
              
              const items = result.data.leaderboard.map(item => ({
                ...item,
                examId: result.examId,
                examTitle: result.examTitle
              }));
              
              allLeaderboardItems.push(...items);
            });
            
            console.log(`Tổng số kết quả leaderboard: ${allLeaderboardItems.length}`);
            
            if (allLeaderboardItems.length > 0) {
              // Xử lý dữ liệu tương tự như code ban đầu
              const studentMap = new Map();
              
              allLeaderboardItems.forEach(item => {
                if (!item.student || !item.student.id) return;
                
                const studentId = item.student.id;
                if (!studentMap.has(studentId)) {
                  studentMap.set(studentId, {
                    student: {
                      ...item.student,
                      // Chuẩn hóa grade thành chỉ 10, 11, 12
                      grade: item.student.grade?.includes('10') ? '10' : 
                            item.student.grade?.includes('11') ? '11' : 
                            item.student.grade?.includes('12') ? '12' : 
                            item.student.grade || 'Không có thông tin'
                    },
                    totalScore: 0,
                    examCount: 0,
                    bestScore: 0,
                    duration: item.duration || 0,
                    completedAt: item.completedAt
                  });
                }
                
                const studentData = studentMap.get(studentId);
                studentData.totalScore += item.score || 0;
                studentData.examCount += 1;
                studentData.bestScore = Math.max(studentData.bestScore, item.score || 0);
                
                // Luôn cập nhật thời gian với kết quả mới nhất
                if (new Date(item.completedAt) > new Date(studentData.completedAt)) {
                  studentData.completedAt = item.completedAt;
                  studentData.duration = item.duration || 0;
                }
              });
              
              // Chuyển Map thành mảng
              let leaderboardArray = Array.from(studentMap.values()).map(data => ({
                student: data.student,
                score: Number((data.totalScore / data.examCount).toFixed(2)),
                completedAt: data.completedAt,
                duration: data.duration
              }));
              
              // Sắp xếp theo điểm giảm dần
              leaderboardArray.sort((a, b) => b.score - a.score);
              
              // Thêm thứ hạng
              leaderboardArray = leaderboardArray.map((item, index) => ({
                ...item,
                rank: index + 1
              }));
              
              console.log('Leaderboard đã xử lý:', leaderboardArray);
              setLeaderboard(leaderboardArray);
              return;
            }
          }
        } catch (examErr) {
          console.error('Lỗi khi tải danh sách đề thi:', examErr);
        }
        
        // Cách 2: Nếu không tải được từ cách 1, thử endpoint backup
        try {
          console.log(`Đang thử tải bảng xếp hạng từ endpoint backup: ${API_URL}/api/Leaderboard/subject/${subjectId}`);
          
          const backupResponse = await axios.get(`${API_URL}/api/Leaderboard/subject/${subjectId}`, config);
          
          if (backupResponse.data && Array.isArray(backupResponse.data) && backupResponse.data.length > 0) {
            console.log('Dữ liệu từ endpoint backup:', backupResponse.data);
            
            // Xử lý dữ liệu từ endpoint backup
            const formattedLeaderboard = backupResponse.data.map((item, index) => ({
              ...item,
              rank: index + 1
            }));
            
            setLeaderboard(formattedLeaderboard);
          } else {
            console.log('Không có dữ liệu từ endpoint backup');
            setLeaderboard([]);
          }
        } catch (backupErr) {
          console.error('Không thể tải dữ liệu từ endpoint backup:', backupErr);
          
          // Nếu tất cả các cách đều thất bại, đặt leaderboard thành mảng rỗng và hiển thị thông báo
          setLeaderboard([]);
          // Không setError ở đây để không hiển thị thông báo lỗi khi chỉ là không có dữ liệu
        }
      } catch (err) {
        console.error('Lỗi chung khi tải dữ liệu bảng xếp hạng:', err);
        if (err.response) {
          console.error('Status:', err.response.status);
          console.error('Data:', err.response.data);
          setError(`Lỗi: ${err.response.status} - ${err.response.data.message || 'Không thể tải dữ liệu'}`);
        } else if (err.request) {
          console.error('Không nhận được phản hồi từ server');
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.');
        } else {
          console.error('Lỗi:', err.message);
          setError(`Đã xảy ra lỗi: ${err.message}`);
        }
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [subjectId, dispatch]);

  const handleBack = () => {
    navigate('/subjects');
  };

  return (
    <Container className="py-4">
      <Button variant="outline-primary" onClick={handleBack} className="mb-3">
        <FaArrowLeft className="me-1" /> Quay lại danh sách môn học
      </Button>
      
      <Card className="mb-4" bg={theme === 'dark' ? 'dark' : 'light'}>
        <Card.Body>
          <div className="d-flex align-items-center">
            <div className="display-4 me-3 text-warning">
              <FaTrophy />
            </div>
            <div>
              <h4 className="mb-1">
                Top 10 học sinh xuất sắc - {currentSubject?.name || `Môn học ${subjectId}`}
              </h4>
              <p className="text-muted mb-0">
                {currentSubject?.description || 'Xếp hạng học sinh có điểm số cao nhất'}
              </p>
              {subjectExams.length > 0 && (
                <p className="mt-2 text-info">
                  Số đề thi: {subjectExams.length}
                </p>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải dữ liệu bảng xếp hạng...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <TopStudentsLeaderboard 
            title={`Bảng xếp hạng - ${currentSubject?.name || 'Môn học'}`}
            students={leaderboard} 
            currentUserId={user?.id}
            isLoading={loading}
          />
          
          {leaderboard.length === 0 && !loading && (
            <Alert variant="info" className="text-center py-4">
              <p className="mb-2">Chưa có dữ liệu bảng xếp hạng</p>
              <p className="mb-0">Hãy hoàn thành bài thi để xuất hiện trong bảng xếp hạng.</p>
            </Alert>
          )}
        </>
      )}
      
      <div className="mt-3 text-center text-muted">
        <small>Bảng xếp hạng được cập nhật sau mỗi lần làm bài thi hoàn thành</small>
      </div>
    </Container>
  );
};

export default SubjectTopStudentsPage;