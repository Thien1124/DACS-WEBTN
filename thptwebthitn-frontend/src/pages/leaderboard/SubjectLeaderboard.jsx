import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useSelector } from 'react-redux';
import Leaderboard from '../../components/leaderboard/Leaderboard';

const SubjectLeaderboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subject, setSubject] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Get the auth token
        const token = localStorage.getItem('token');
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
        
        // Fetch all subjects
        const subjectsRes = await axios.get(`${API_URL}/api/Subjects`, config);
        setSubjects(subjectsRes.data);
        
        // If there are subjects, select the first one by default
        if (subjectsRes.data.length > 0) {
          setSelectedSubject(subjectsRes.data[0].id);
        }
        
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách môn học. Vui lòng thử lại sau.');
        console.error('Error fetching subjects:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Fetch leaderboard when selected subject changes
    if (selectedSubject) {
      fetchLeaderboard();
    }
  }, [selectedSubject]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Get the auth token
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      // Fetch subject details and leaderboard in parallel
      const [subjectRes, leaderboardRes] = await Promise.all([
        axios.get(`${API_URL}/api/Subjects/${selectedSubject}`, config),
        axios.get(`${API_URL}/api/ExamResults/subject-leaderboard/${selectedSubject}`, config)
      ]);
      
      setSubject(subjectRes.data);
      setLeaderboard(leaderboardRes.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải bảng xếp hạng. Vui lòng thử lại sau.');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  if (initialLoading) return <LoadingSpinner />;
  if (error && !selectedSubject) return <ErrorAlert message={error} />;
  if (subjects.length === 0) return <Alert variant="warning">Không có môn học nào.</Alert>;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Bảng xếp hạng theo môn học</h2>
        </div>
        <Button variant="outline-primary" onClick={() => navigate('/subjects')}>
          <FaArrowLeft className="me-2" /> Quay lại danh sách môn học
        </Button>
      </div>
      
      <Card className="mb-4 shadow-sm" bg={theme === 'dark' ? 'dark' : 'light'}>
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <div className="display-4 me-3 text-warning">
              <FaTrophy />
            </div>
            <div>
              <h4 className="mb-1">Top 10 học sinh xuất sắc</h4>
              <p className="text-muted mb-0">
                Chọn môn học để xem bảng xếp hạng
              </p>
            </div>
          </div>
          
          <Form.Group>
            <Form.Select 
              value={selectedSubject} 
              onChange={handleSubjectChange}
              disabled={loading}
            >
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>
      
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <>
          <Leaderboard 
            title={`Bảng xếp hạng môn ${subject?.name}`} 
            leaders={leaderboard} 
            currentUserId={user?.id} 
          />
          
          <div className="mt-3 text-center text-muted">
            <small>Bảng xếp hạng hiển thị điểm trung bình cao nhất của mỗi học sinh trong các đề thi của môn học</small>
          </div>
        </>
      )}
    </Container>
  );
};

export default SubjectLeaderboard;