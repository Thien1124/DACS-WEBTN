import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { FaTrophy, FaArrowLeft } from 'react-icons/fa';
import TopStudentsLeaderboard from '../../components/leaderboard/TopStudentsLeaderboard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubjectById } from '../../redux/subjectSlice';

// Import mock data
import { getTopStudentsBySubject } from '../../data/mockLeaderboardData';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch subject info
        if (subjectId) {
          try {
            dispatch(fetchSubjectById(subjectId));
          } catch (err) {
            console.warn('Could not fetch subject:', err);
            // Continue anyway - we'll show default text
          }
          
          // Fetch leaderboard data - using mock for demo
          console.log(`Fetching leaderboard data for subject ${subjectId}`);
          const data = await getTopStudentsBySubject(Number(subjectId));
          console.log('Leaderboard data loaded:', data);
          setLeaderboard(data);
        }
      } catch (err) {
        console.error('Error loading leaderboard data:', err);
        setError('Không thể tải dữ liệu bảng xếp hạng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [subjectId, dispatch]);

  const handleBack = () => {
    navigate('/subjects');
  };

  console.log('Rendering leaderboard with data:', leaderboard);

  return (
    <Container className="py-4">
      <Button variant="outline-primary" onClick={handleBack} className="mb-3">
        <FaArrowLeft className="me-1" /> Quay lại danh sách môn học
      </Button>
      
      <Card className="mb-4">
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
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      <TopStudentsLeaderboard 
        title={`Bảng xếp hạng - ${currentSubject?.name || 'Môn học'}`}
        students={leaderboard}
        currentUserId={user?.id}
        isLoading={loading}
      />
      
      <div className="mt-3 text-center text-muted">
        <small>Bảng xếp hạng được cập nhật sau mỗi lần làm bài thi hoàn thành</small>
      </div>
    </Container>
  );
};

export default SubjectTopStudentsPage;