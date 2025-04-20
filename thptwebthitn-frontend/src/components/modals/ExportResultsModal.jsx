import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFileDownload, FaCalendarAlt, FaTimes, FaCheck } from 'react-icons/fa';

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
  max-height: 90vh;
  overflow-y: auto;
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
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  cursor: pointer;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const DateInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  cursor: pointer;
`;

const DateContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #4285f4, #34a853)' 
    : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.primary ? '#ffffff' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
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

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const ExportResultsModal = ({ show, onClose, theme, onExport }) => {
  const [exportType, setExportType] = useState('all');
  const [examId, setExamId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState({
    studentId: true,
    studentName: true,
    examTitle: true,
    score: true,
    totalQuestions: true,
    correctAnswers: true,
    completionTime: true,
    submittedAt: true,
  });

  if (!show) return null;

  const handleExport = () => {
    setIsLoading(true);
    
    // Prepare export data
    const exportConfig = {
      type: exportType,
      examId: exportType === 'specific' ? examId : null,
      dateRange: exportType === 'dateRange' ? { startDate, endDate } : null,
      columns: Object.keys(selectedColumns).filter(key => selectedColumns[key]),
    };
    
    // Simulate API call
    setTimeout(() => {
      onExport(exportConfig);
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const handleCheckboxChange = (field) => {
    setSelectedColumns(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Mock exam list for dropdown
  const mockExams = [
    { id: 1, title: 'Đề thi Toán học THPT Quốc Gia' },
    { id: 2, title: 'Đề thi Vật lý học kỳ 1' },
    { id: 3, title: 'Đề thi Hóa học cơ bản' },
  ];

  return (
    <ModalOverlay>
      <ModalContainer theme={theme}>
        <ModalHeader>
          <ModalTitle theme={theme}>Xuất kết quả thi ra file CSV</ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <IconWrapper>
          <FaFileDownload size={48} color="#4299e1" />
        </IconWrapper>
        
        <FormGroup>
          <Label theme={theme}>Chọn dữ liệu xuất</Label>
          <Select 
            theme={theme}
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
          >
            <option value="all">Tất cả kết quả thi</option>
            <option value="specific">Theo đề thi cụ thể</option>
            <option value="dateRange">Theo khoảng thời gian</option>
          </Select>
        </FormGroup>
        
        {exportType === 'specific' && (
          <FormGroup>
            <Label theme={theme}>Chọn đề thi</Label>
            <Select 
              theme={theme}
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
            >
              <option value="">-- Chọn đề thi --</option>
              {mockExams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </Select>
          </FormGroup>
        )}
        
        {exportType === 'dateRange' && (
          <FormGroup>
            <Label theme={theme}>Khoảng thời gian</Label>
            <DateContainer>
              <div>
                <Label theme={theme} style={{ fontSize: '0.875rem' }}>Từ ngày</Label>
                <DateInput 
                  type="date" 
                  theme={theme}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label theme={theme} style={{ fontSize: '0.875rem' }}>Đến ngày</Label>
                <DateInput 
                  type="date" 
                  theme={theme}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </DateContainer>
          </FormGroup>
        )}
        
        <FormGroup>
          <Label theme={theme}>Chọn cột xuất ra file</Label>
          <CheckboxContainer>
            <CheckboxLabel theme={theme}>
              <Checkbox 
                type="checkbox" 
                checked={selectedColumns.studentId}
                onChange={() => handleCheckboxChange('studentId')}
              />
              Mã học sinh
            </CheckboxLabel>
            <CheckboxLabel theme={theme}>
              <Checkbox 
                type="checkbox" 
                checked={selectedColumns.studentName}
                onChange={() => handleCheckboxChange('studentName')}
              />
              Tên học sinh
            </CheckboxLabel>
            <CheckboxLabel theme={theme}>
              <Checkbox 
                type="checkbox" 
                checked={selectedColumns.examTitle}
                onChange={() => handleCheckboxChange('examTitle')}
              />
              Tên đề thi
            </CheckboxLabel>
            <CheckboxLabel theme={theme}>
              <Checkbox 
                type="checkbox" 
                checked={selectedColumns.score}
                onChange={() => handleCheckboxChange('score')}
              />
              Điểm số
            </CheckboxLabel>
            <CheckboxLabel theme={theme}>
              <Checkbox 
                type="checkbox" 
                checked={selectedColumns.totalQuestions}
                onChange={() => handleCheckboxChange('totalQuestions')}
              />
              Tổng số câu hỏi
            </CheckboxLabel>
            <CheckboxLabel theme={theme}>
              <Checkbox 
                type="checkbox" 
                checked={selectedColumns.correctAnswers}
                onChange={() => handleCheckboxChange('correctAnswers')}
              />
              Số câu trả lời đúng
            </CheckboxLabel>
            <CheckboxLabel theme={theme}>
              <Checkbox 
                type="checkbox" 
                checked={selectedColumns.completionTime}
                onChange={() => handleCheckboxChange('completionTime')}
              />
              Thời gian làm bài
            </CheckboxLabel>
            <CheckboxLabel theme={theme}>
              <Checkbox 
                type="checkbox" 
                checked={selectedColumns.submittedAt}
                onChange={() => handleCheckboxChange('submittedAt')}
              />
              Thời gian nộp bài
            </CheckboxLabel>
          </CheckboxContainer>
        </FormGroup>
        
        <ButtonGroup>
          <Button theme={theme} onClick={onClose}>
            <FaTimes /> Hủy bỏ
          </Button>
          <Button 
            theme={theme} 
            primary 
            onClick={handleExport}
            disabled={isLoading || (exportType === 'specific' && !examId) || 
              (exportType === 'dateRange' && (!startDate || !endDate)) ||
              !Object.values(selectedColumns).some(Boolean)}
          >
            {isLoading ? 'Đang xử lý...' : <><FaCheck /> Xuất dữ liệu</>}
          </Button>
        </ButtonGroup>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ExportResultsModal;