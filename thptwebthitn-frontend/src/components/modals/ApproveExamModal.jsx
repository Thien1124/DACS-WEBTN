import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaInfoCircle, FaTimes, FaCheck } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  padding: 1.5rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  cursor: pointer;
`;

const ExamInfo = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#3a4966' : '#f7fafc'};
  border-radius: 8px;
  border-left: 4px solid ${props => props.isApproved ? '#48bb78' : '#4299e1'};
`;

const ExamTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ExamDetail = styled.p`
  margin: 0.25rem 0;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.9rem;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: ${props => props.approved ? '#c6f6d5' : '#e9d8fd'};
  color: ${props => props.approved ? '#22543d' : '#553c9a'};
  margin-top: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const InfoBox = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#2a4365' : '#ebf8ff'};
  border-left: 4px solid #4299e1;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2c5282'};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #48bb78, #38a169)' 
    : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.primary ? '#ffffff' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ApproveExamModal = ({ 
  show, 
  onClose, 
  theme, 
  exam, 
  onApprove 
}) => {
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!show || !exam) return null;

  const handleApprove = () => {
    setIsLoading(true);
    onApprove(exam.id, comment)
      .then(() => {
        setIsLoading(false);
        setComment('');
        onClose();
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  return (
    <ModalOverlay>
      <ModalContainer theme={theme}>
        <ModalHeader>
          <ModalTitle theme={theme}>
            <FaCheckCircle color="#48bb78" /> Duyệt đề thi
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ExamInfo theme={theme} isApproved={exam.isApproved}>
          <ExamTitle theme={theme}>{exam.title}</ExamTitle>
          <ExamDetail theme={theme}>Môn học: {exam.subject?.name || 'Không có'}</ExamDetail>
          <ExamDetail theme={theme}>Số câu hỏi: {exam.questionCount || exam.questions?.length || '0'}</ExamDetail>
          <ExamDetail theme={theme}>
            Thời gian làm bài: <strong>{exam.duration} phút</strong>
          </ExamDetail>
          <ExamDetail theme={theme}>
            Tác giả: <strong>{exam.createdBy || 'Admin'}</strong>
          </ExamDetail>
          
          <StatusBadge approved={exam.isApproved}>
            {exam.isApproved ? 
              <><FaCheckCircle /> Đã duyệt</> : 
              <><FaInfoCircle /> Chờ duyệt</>
            }
          </StatusBadge>
        </ExamInfo>
        
        {!exam.isApproved && (
          <InfoBox theme={theme}>
            <FaInfoCircle size={16} />
            <div>
              Đề thi chưa được duyệt sẽ không hiển thị cho học sinh. Vui lòng kiểm tra kỹ nội dung trước khi duyệt.
            </div>
          </InfoBox>
        )}
        
        {exam.isApproved ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: theme === 'dark' ? '#e2e8f0' : '#2d3748' }}>
            <FaCheckCircle size={48} color="#48bb78" />
            <h3>Đề thi này đã được duyệt</h3>
            <p style={{ color: theme === 'dark' ? '#a0aec0' : '#718096' }}>
              Đề thi đã được công khai và hiển thị cho học sinh.
            </p>
          </div>
        ) : (
          <>
            <FormGroup>
              <Label theme={theme}>Ghi chú (không bắt buộc)</Label>
              <TextArea
                theme={theme}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập ghi chú về đề thi này (nếu có)..."
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button theme={theme} onClick={onClose}>
                <FaTimes /> Hủy bỏ
              </Button>
              <Button 
                theme={theme} 
                primary 
                onClick={handleApprove} 
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : <><FaCheck /> Duyệt đề thi</>}
              </Button>
            </ButtonGroup>
          </>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ApproveExamModal;