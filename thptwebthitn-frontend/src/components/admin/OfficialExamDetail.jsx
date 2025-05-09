import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaCalendarAlt, FaUserGraduate, FaClock, 
  FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaChartBar,
  FaGraduationCap, FaBook, FaUser, FaInfoCircle, FaClipboardList,
  FaQuestionCircle, FaCheckSquare, FaSort, FaFileAlt
} from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal from '../common/ConfirmModal';

// Main container
const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(180deg, #1a202c 0%, #171923 100%)' 
    : 'linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%)'};
`;

// Header with navigation
const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  }
`;

// Main content layout
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

// Card components
const Card = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

// Status badge
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
  
  ${props => {
    if (props.status === 'Đang mở') {
      return `
        background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
        color: #276749;
      `;
    } else if (props.status === 'Sắp diễn ra') {
      return `
        background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
        color: #2b6cb0;
      `;
    } else {
      return `
        background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
        color: #4a5568;
      `;
    }
  }}
`;

// Info list
const InfoList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const InfoLabel = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
`;

// Description box
const Description = styled.div`
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-radius: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 0.95rem;
`;

// Students table
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
`;

const Th = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.025em;
  
  &:first-child {
    border-top-left-radius: 0.5rem;
  }
  
  &:last-child {
    border-top-right-radius: 0.5rem;
    text-align: center;
  }
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  vertical-align: middle;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 0.9rem;
  
  &:last-child {
    text-align: center;
  }
`;

// Student status badge
const CompletionStatus = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
  
  ${props => props.completed ? `
    background-color: #C6F6D5;
    color: #276749;
  ` : `
    background-color: #FED7D7;
    color: #9B2C2C;
  `}
`;

// Action buttons
const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.edit {
    background-color: #EBF8FF;
    color: #3182CE;
    
    &:hover {
      background-color: #BEE3F8;
    }
  }
  
  &.delete {
    background-color: #FFF5F5;
    color: #E53E3E;
    
    &:hover {
      background-color: #FED7D7;
    }
  }
  
  &.results {
    background-color: #FAF5FF;
    color: #805AD5;
    
    &:hover {
      background-color: #E9D8FD;
    }
  }
  
  &.students {
    background-color: #F0FFF4;
    color: #38A169;
    
    &:hover {
      background-color: #C6F6D5;
    }
  }
`;

// Loading state
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  h3 {
    margin-top: 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

// Exam stats grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.color || (props.theme === 'dark' ? '#e2e8f0' : '#2d3748')};
    margin-bottom: 0.25rem;
  }
  
  .label {
    font-size: 0.85rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

// Helper functions
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const calculateExamStatus = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (now < start) return 'Sắp diễn ra';
  if (now >= start && now <= end) return 'Đang mở';
  return 'Đã kết thúc';
};

const OfficialExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  const [loading, setLoading] = useState(true);
  const [examDetail, setExamDetail] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  useEffect(() => {
    fetchExamDetail();
  }, [id]);
  
  const fetchExamDetail = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/official-exams/${id}`);
      console.log('Exam detail response:', response.data);
      setExamDetail(response.data);
    } catch (error) {
      console.error('Error fetching exam detail:', error);
      showErrorToast('Không thể tải thông tin kỳ thi');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditExam = () => {
    navigate(`/admin/official-exams/edit/${id}`);
  };
  
  const handleViewResults = () => {
    navigate(`/admin/official-exams/${id}/results`);
  };
  
  const handleManageStudents = () => {
    navigate(`/admin/official-exams/${id}/students`);
  };
  
  const handleConfirmDelete = async () => {
    try {
      await apiClient.delete(`/api/official-exams/${id}`);
      showSuccessToast('Xóa kỳ thi thành công');
      navigate('/admin/official-exams');
    } catch (error) {
      console.error('Error deleting exam:', error);
      showErrorToast('Không thể xóa kỳ thi');
    } finally {
      setShowConfirmDialog(false);
    }
  };
  
  if (loading) {
    return (
      <Container theme={theme}>
        <Header>
          <BackButton 
            theme={theme}
            onClick={() => navigate('/admin/official-exams')}
          >
            <FaArrowLeft /> Quay lại danh sách
          </BackButton>
        </Header>
        
        <LoadingContainer theme={theme}>
          <LoadingSpinner size={60} />
          <h3>Đang tải thông tin kỳ thi</h3>
        </LoadingContainer>
      </Container>
    );
  }
  
  if (!examDetail) {
    return (
      <Container theme={theme}>
        <Header>
          <BackButton 
            theme={theme}
            onClick={() => navigate('/admin/official-exams')}
          >
            <FaArrowLeft /> Quay lại danh sách
          </BackButton>
        </Header>
        
        <Card theme={theme}>
          <CardBody>
            <p style={{ textAlign: 'center', padding: '2rem' }}>
              Không tìm thấy thông tin kỳ thi
            </p>
          </CardBody>
        </Card>
      </Container>
    );
  }
  
  const examStatus = calculateExamStatus(examDetail.startTime, examDetail.endTime);
  
  return (
    <Container theme={theme}>
      <Header>
        <BackButton 
          theme={theme}
          onClick={() => navigate('/admin/official-exams')}
        >
          <FaArrowLeft /> Quay lại danh sách
        </BackButton>
      </Header>
      
      <ContentGrid>
        <div>
          <Card 
            theme={theme}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardHeader theme={theme}>
              <CardTitle theme={theme}>
                <FaInfoCircle /> Thông tin kỳ thi
              </CardTitle>
              <StatusBadge status={examStatus}>
                {examStatus}
              </StatusBadge>
            </CardHeader>
            
            <CardBody>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '700',
                marginTop: 0,
                marginBottom: '0.5rem',
                color: theme === 'dark' ? '#e2e8f0' : '#2d3748'
              }}>
                {examDetail.title}
              </h1>
              
              <p style={{ 
                fontSize: '1rem',
                color: theme === 'dark' ? '#a0aec0' : '#718096',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <FaBook /> Đề: {examDetail.examTitle || `Đề thi #${examDetail.examId}`}
              </p>
              
              {examDetail.description && (
                <Description theme={theme}>
                  {examDetail.description}
                </Description>
              )}
              
              <InfoList>
                <InfoItem>
                  <InfoLabel theme={theme}><FaCalendarAlt /> Thời gian bắt đầu</InfoLabel>
                  <InfoValue theme={theme}>{formatDateTime(examDetail.startTime)}</InfoValue>
                </InfoItem>
                
                <InfoItem>
                  <InfoLabel theme={theme}><FaClock /> Thời gian kết thúc</InfoLabel>
                  <InfoValue theme={theme}>{formatDateTime(examDetail.endTime)}</InfoValue>
                </InfoItem>
                
                <InfoItem>
                  <InfoLabel theme={theme}><FaGraduationCap /> Khối lớp</InfoLabel>
                  <InfoValue theme={theme}>{examDetail.classroomName}</InfoValue>
                </InfoItem>
                
                <InfoItem>
                  <InfoLabel theme={theme}><FaUser /> Người tạo</InfoLabel>
                  <InfoValue theme={theme}>{examDetail.creator?.fullName || examDetail.creator?.username}</InfoValue>
                </InfoItem>
              </InfoList>
              
              <hr style={{ margin: '1.5rem 0', borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0', opacity: 0.5 }} />
              
              <div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginTop: 0,
                  marginBottom: '1rem',
                  color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaClipboardList /> Thống kê
                </h3>
                
                <StatsGrid>
                  <StatCard theme={theme} color="#4299e1">
                    <div className="value">{examDetail.assignedStudentsCount}</div>
                    <div className="label">Học sinh đăng ký</div>
                  </StatCard>
                  
                  <StatCard theme={theme} color="#38a169">
                    <div className="value">{examDetail.completedStudentsCount}</div>
                    <div className="label">Đã hoàn thành</div>
                  </StatCard>
                  
                  <StatCard theme={theme} color="#ed8936">
                    <div className="value">
                      {examDetail.completedStudentsCount > 0 ? 
                        `${Math.round((examDetail.completedStudentsCount / examDetail.assignedStudentsCount) * 100)}%` : 
                        '0%'}
                    </div>
                    <div className="label">Tỷ lệ hoàn thành</div>
                  </StatCard>
                </StatsGrid>
              </div>
              
              <ActionButtonsContainer>
                <ActionButton 
                  className="edit"
                  onClick={handleEditExam}
                >
                  <FaEdit /> Chỉnh sửa
                </ActionButton>
                
                <ActionButton 
                  className="results"
                  onClick={handleViewResults}
                >
                  <FaChartBar /> Xem kết quả
                </ActionButton>
                
                <ActionButton 
                  className="students"
                  onClick={handleManageStudents}
                >
                  <FaUserGraduate /> Quản lý học sinh
                </ActionButton>
                
                <ActionButton 
                  className="delete"
                  onClick={() => setShowConfirmDialog(true)}
                >
                  <FaTrash /> Xóa kỳ thi
                </ActionButton>
              </ActionButtonsContainer>
            </CardBody>
          </Card>
        </div>
        
        <div>
          <Card 
            theme={theme}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CardHeader theme={theme}>
              <CardTitle theme={theme}>
                <FaFileAlt /> Thông tin đề thi
              </CardTitle>
            </CardHeader>
            
            <CardBody>
              {examDetail.exam && (
                <>
                  <h3 style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '600',
                    marginTop: 0,
                    marginBottom: '1rem',
                    color: theme === 'dark' ? '#e2e8f0' : '#2d3748'
                  }}>
                    {examDetail.exam.title}
                  </h3>
                  
                  <InfoList>
                    <InfoItem>
                      <InfoLabel theme={theme}><FaBook /> Môn học</InfoLabel>
                      <InfoValue theme={theme}>{examDetail.exam.subject?.name || "Không xác định"}</InfoValue>
                    </InfoItem>
                    
                    <InfoItem>
                      <InfoLabel theme={theme}><FaClock /> Thời gian làm bài</InfoLabel>
                      <InfoValue theme={theme}>{examDetail.exam.duration} phút</InfoValue>
                    </InfoItem>
                    
                    <InfoItem>
                      <InfoLabel theme={theme}><FaQuestionCircle /> Số câu hỏi</InfoLabel>
                      <InfoValue theme={theme}>{examDetail.exam.questionCount} câu</InfoValue>
                    </InfoItem>
                    
                    <InfoItem>
                      <InfoLabel theme={theme}><FaCheckSquare /> Loại đề thi</InfoLabel>
                      <InfoValue theme={theme}>{examDetail.exam.type}</InfoValue>
                    </InfoItem>
                    
                    <InfoItem>
                      <InfoLabel theme={theme}><FaCheckCircle /> Điểm đạt</InfoLabel>
                      <InfoValue theme={theme}>{examDetail.exam.passScore}/{examDetail.exam.totalScore}</InfoValue>
                    </InfoItem>
                    
                    <InfoItem>
                      <InfoLabel theme={theme}><FaSort /> Trộn câu hỏi</InfoLabel>
                      <InfoValue theme={theme}>{examDetail.exam.shuffleQuestions ? "Có" : "Không"}</InfoValue>
                    </InfoItem>
                  </InfoList>
                </>
              )}
            </CardBody>
          </Card>
          
          <Card 
            theme={theme}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <CardHeader theme={theme}>
              <CardTitle theme={theme}>
                <FaUserGraduate /> Danh sách học sinh ({examDetail.students?.length || 0})
              </CardTitle>
            </CardHeader>
            
            <CardBody>
              {examDetail.students && examDetail.students.length > 0 ? (
                <Table>
                  <thead>
                    <tr>
                      <Th theme={theme}>Học sinh</Th>
                      <Th theme={theme}>Mã học sinh</Th>
                      <Th theme={theme}>Trạng thái</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {examDetail.students.map((student) => (
                      <tr key={student.id}>
                        <Td theme={theme}>{student.studentName}</Td>
                        <Td theme={theme}>{student.studentCode}</Td>
                        <Td theme={theme}>
                          {student.hasTaken ? (
                            <CompletionStatus completed>
                              <FaCheckCircle /> Đã hoàn thành
                            </CompletionStatus>
                          ) : (
                            <CompletionStatus completed={false}>
                              <FaTimesCircle /> Chưa làm bài
                            </CompletionStatus>
                          )}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p style={{ textAlign: 'center', padding: '1rem' }}>
                  Chưa có học sinh nào được phân công
                </p>
              )}
              
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <ActionButton 
                  className="students"
                  onClick={handleManageStudents}
                  style={{ width: '100%' }}
                >
                  <FaUserGraduate /> Quản lý danh sách học sinh
                </ActionButton>
              </div>
            </CardBody>
          </Card>
        </div>
      </ContentGrid>
      
      {showConfirmDialog && (
        <ConfirmModal
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa kỳ thi "${examDetail.title}"?`}
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </Container>
  );
};

export default OfficialExamDetail;