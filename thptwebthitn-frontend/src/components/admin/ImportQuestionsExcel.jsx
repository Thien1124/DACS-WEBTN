import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import { 
  FaFileExcel, FaUpload, FaEye, FaCheck, 
  FaTimes, FaDownload, FaQuestionCircle, 
  FaInfoCircle, FaSave, FaArrowLeft 
} from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchSubjects } from '../../redux/subjectSlice';
import { bulkImportQuestions } from '../../redux/questionSlice';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin: 0.5rem 0 0 0;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  background-color: ${props => props.primary 
    ? '#4299e1' 
    : props.success
      ? '#48bb78'
      : props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  color: ${props => props.primary || props.success
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:hover {
    background-color: ${props => props.primary 
      ? '#3182ce' 
      : props.success
        ? '#38a169'
        : props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Card = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const UploadZone = styled.div`
  border: 2px dashed ${props => props.isDragActive 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: ${props => props.isDragActive 
    ? props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)'
    : 'transparent'};
  
  &:hover {
    border-color: #4299e1;
    background-color: ${props => 
      props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)'};
  }
`;

const UploadIcon = styled(FaFileExcel)`
  font-size: 3rem;
  color: ${props => props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const UploadSubtext = styled.p`
  margin: 0.5rem 0 0 0;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const FileInput = styled.input`
  display: none;
`;

const InfoBox = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: ${props => props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)'};
  border-left: 4px solid #4299e1;
`;

const InfoTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoList = styled.ul`
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const TemplateLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: #4299e1;
  font-weight: 500;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StepContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Step = styled.div`
  flex: 1;
  padding: 1rem;
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.active 
      ? '#4299e1' 
      : 'transparent'};
  }
  
  @media (max-width: 768px) {
    text-align: left;
    padding: 0.5rem 0;
    
    &:after {
      bottom: 0;
    }
  }
`;

const StepNumber = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.active 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.active 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 600;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    margin-right: 0.5rem;
    margin-bottom: 0;
  }
`;

const StepTitle = styled.div`
  font-weight: 500;
  color: ${props => props.active 
    ? props.theme === 'dark' ? '#90cdf4' : '#3182ce'
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  @media (max-width: 768px) {
    display: inline;
  }
`;

const PreviewTable = styled.div`
  overflow-x: auto;
  margin-top: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem 1rem;
    border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    text-align: left;
  }
  
  th {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    font-weight: 600;
  }
  
  td {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  tr:nth-child(even) {
    background-color: ${props => props.theme === 'dark' ? '#374151' : '#f7fafc'};
  }
  
  tr:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
`;

const ValidationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  gap: 0.25rem;
  
  background-color: ${props => props.valid 
    ? props.theme === 'dark' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(72, 187, 120, 0.1)'
    : props.theme === 'dark' ? 'rgba(245, 101, 101, 0.2)' : 'rgba(245, 101, 101, 0.1)'};
  color: ${props => props.valid 
    ? props.theme === 'dark' ? '#68d391' : '#38a169'
    : props.theme === 'dark' ? '#fc8181' : '#e53e3e'};
`;

const ValidationMessage = styled.p`
  color: ${props => props.error 
    ? props.theme === 'dark' ? '#fc8181' : '#e53e3e'
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const ImportProgress = styled.div`
  margin-top: 1.5rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
  
  &:after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background-color: #4299e1;
    transition: width 0.3s ease;
  }
`;

const Summary = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: 0.375rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const SummaryTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.span`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const SummaryValue = styled.span`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const SummaryResult = styled.div`
  margin-top: 1rem;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 500;
  color: ${props => props.success 
    ? props.theme === 'dark' ? '#68d391' : '#38a169'
    : props.theme === 'dark' ? '#fc8181' : '#e53e3e'};
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ImportQuestionsExcel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const fileInputRef = useRef(null);
  
  // States
  const [step, setStep] = useState(1);
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [validationResults, setValidationResults] = useState({
    isValid: false,
    errors: [],
    validCount: 0,
    invalidCount: 0
  });
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  
  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      showErrorToast('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }
    
    setFile(selectedFile);
    
    // Read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        setFileData(jsonData);
        parseExcelData(jsonData);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        showErrorToast('Có lỗi xảy ra khi đọc file Excel');
      }
    };
    
    reader.readAsArrayBuffer(selectedFile);
  };
  
  // Parse Excel data into questions
  const parseExcelData = (data) => {
    // Skip header row and empty rows
    const rows = data.filter((row, index) => index > 0 && row.length > 0);
    
    const parsedQuestions = rows.map((row, index) => {
      // Expected columns: subject, questionText, difficulty, answerA, answerB, answerC, answerD, correctAnswer, explanation, chapter
      return {
        index: index + 1,
        subject: row[0] || '',
        content: row[1] || '',
        difficulty: row[2] || 'medium',
        optionA: row[3] || '',
        optionB: row[4] || '',
        optionC: row[5] || '',
        optionD: row[6] || '',
        correctAnswer: row[7] || '',
        explanation: row[8] || '',
        chapter: row[9] || '',
      };
    });
    
    setQuestions(parsedQuestions);
    validateQuestions(parsedQuestions);
    setStep(2); // Move to preview step
  };
  
  // Validate questions
  const validateQuestions = (questions) => {
    const errors = [];
    let validCount = 0;
    let invalidCount = 0;
    
    questions.forEach((question, index) => {
      const rowErrors = [];
      
      // Validate required fields
      if (!question.subject) rowErrors.push('Thiếu môn học');
      if (!question.content) rowErrors.push('Thiếu nội dung câu hỏi');
      if (!question.optionA) rowErrors.push('Thiếu đáp án A');
      if (!question.optionB) rowErrors.push('Thiếu đáp án B');
      if (!question.correctAnswer) rowErrors.push('Thiếu đáp án đúng');
      
      // Validate correct answer is one of the options
      const validAnswers = ['A', 'B', 'C', 'D'];
      const normalizedAnswer = question.correctAnswer.toUpperCase().trim();
      if (!validAnswers.includes(normalizedAnswer)) {
        rowErrors.push('Đáp án đúng phải là một trong các giá trị: A, B, C, D');
      }
      
      // Add row errors if any
      if (rowErrors.length > 0) {
        errors.push({
          row: index + 2, // +2 because of 0-indexing and header row
          errors: rowErrors
        });
        invalidCount++;
      } else {
        validCount++;
      }
    });
    
    setValidationResults({
      isValid: errors.length === 0,
      errors,
      validCount,
      invalidCount
    });
    
    return errors.length === 0;
  };
  
  // Handle file drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  
  const handleDragLeave = () => {
    setIsDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  // Handle click on upload zone
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  // Download template
  const handleDownloadTemplate = () => {
    // Create a template worksheet
    const template = [
      ['Môn học (*)', 'Nội dung câu hỏi (*)', 'Độ khó', 'Đáp án A (*)', 'Đáp án B (*)', 'Đáp án C', 'Đáp án D', 'Đáp án đúng (*)', 'Giải thích', 'Chương/bài'],
      ['Toán', 'Câu hỏi mẫu?', 'medium', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'A', 'Giải thích cho đáp án', 'Chương 1'],
      ['Vật lý', 'Câu hỏi mẫu khác?', 'hard', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'B', 'Giải thích cho đáp án', 'Chương 2'],
    ];
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Generate file and download
    XLSX.writeFile(wb, 'mau_nhap_cau_hoi.xlsx');
  };
  
  // Handle import
  const handleImport = async () => {
    if (!validationResults.isValid) {
      showErrorToast('Vui lòng sửa lỗi trước khi nhập câu hỏi');
      return;
    }
    
    setImporting(true);
    setStep(3); // Move to import step
    
    try {
      // Prepare questions data for API
      const questionsToImport = questions.map(q => ({
        subject: q.subject,
        content: q.content,
        difficulty: q.difficulty.toLowerCase(),
        options: [
          { text: q.optionA, isCorrect: q.correctAnswer.toUpperCase().trim() === 'A' },
          { text: q.optionB, isCorrect: q.correctAnswer.toUpperCase().trim() === 'B' },
          { text: q.optionC, isCorrect: q.correctAnswer.toUpperCase().trim() === 'C' },
          { text: q.optionD, isCorrect: q.correctAnswer.toUpperCase().trim() === 'D' }
        ].filter(option => option.text), // Remove empty options
        explanation: q.explanation,
        chapter: q.chapter
      }));
      
      // Mock progress updates
      const updateProgressInterval = setInterval(() => {
        setImportProgress(prev => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // In a real app, call your API to import questions
      // const response = await dispatch(bulkImportQuestions(questionsToImport)).unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(updateProgressInterval);
      setImportProgress(100);
      
      // Set import results
      setImportResults({
        success: true,
        total: questions.length,
        imported: questions.length,
        failed: 0,
        message: 'Nhập câu hỏi thành công'
      });
      
      showSuccessToast(`Đã nhập thành công ${questions.length} câu hỏi`);
    } catch (error) {
      console.error('Error importing questions:', error);
      
      setImportResults({
        success: false,
        total: questions.length,
        imported: 0,
        failed: questions.length,
        message: error.message || 'Có lỗi xảy ra khi nhập câu hỏi'
      });
      
      showErrorToast('Có lỗi xảy ra khi nhập câu hỏi');
    } finally {
      setImporting(false);
    }
  };
  
  // Handle go back to questions list
  const handleGoBack = () => {
    navigate('/admin/questions');
  };
  
  // Handle restart import process
  const handleRestart = () => {
    setStep(1);
    setFile(null);
    setFileData(null);
    setQuestions([]);
    setValidationResults({
      isValid: false,
      errors: [],
      validCount: 0,
      invalidCount: 0
    });
    setImporting(false);
    setImportProgress(0);
    setImportResults(null);
  };
  
  return (
    <Container>
      <Header>
        <div>
          <Title theme={theme}>
            <FaFileExcel /> Nhập câu hỏi từ Excel
          </Title>
          <Subtitle theme={theme}>Nhập hàng loạt câu hỏi từ file Excel vào hệ thống</Subtitle>
        </div>
        <Button onClick={handleGoBack} theme={theme}>
          <FaArrowLeft /> Quay lại
        </Button>
      </Header>
      
      <StepContainer theme={theme}>
        <Step active={step === 1}>
          <StepNumber active={step === 1} theme={theme}>1</StepNumber>
          <StepTitle active={step === 1} theme={theme}>Tải lên file</StepTitle>
        </Step>
        <Step active={step === 2}>
          <StepNumber active={step === 2} theme={theme}>2</StepNumber>
          <StepTitle active={step === 2} theme={theme}>Xem trước và kiểm tra</StepTitle>
        </Step>
        <Step active={step === 3}>
          <StepNumber active={step === 3} theme={theme}>3</StepNumber>
          <StepTitle active={step === 3} theme={theme}>Nhập dữ liệu</StepTitle>
        </Step>
      </StepContainer>
      
      {step === 1 && (
        <Card theme={theme}>
          <CardHeader theme={theme}>
            <CardTitle theme={theme}>
              <FaUpload /> Tải lên file Excel
            </CardTitle>
          </CardHeader>
          <CardBody>
            <UploadZone 
              theme={theme}
              isDragActive={isDragActive}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <UploadIcon theme={theme} />
              <UploadText theme={theme}>
                Kéo và thả file Excel hoặc click để chọn file
              </UploadText>
              <UploadSubtext theme={theme}>
                Hỗ trợ file .xlsx, .xls
              </UploadSubtext>
              
              <FileInput 
                type="file" 
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
              />
            </UploadZone>
            
            <InfoBox theme={theme}>
              <InfoTitle theme={theme}>
                <FaInfoCircle /> Hướng dẫn nhập câu hỏi
              </InfoTitle>
              <InfoList theme={theme}>
                <li>File Excel phải theo định dạng mẫu, với các cột: Môn học, Nội dung câu hỏi, Độ khó, Đáp án A, Đáp án B, Đáp án C, Đáp án D, Đáp án đúng, Giải thích, Chương/bài</li>
                <li>Các trường bắt buộc: Môn học, Nội dung câu hỏi, Đáp án A, Đáp án B, Đáp án đúng</li>
                <li>Đáp án đúng phải là một trong các giá trị: A, B, C, D</li>
                <li>Độ khó có thể là: easy, medium, hard (mặc định là medium)</li>
              </InfoList>
              <div style={{ marginTop: '1rem' }}>
                <TemplateLink href="#" onClick={handleDownloadTemplate}>
                  <FaDownload /> Tải file mẫu
                </TemplateLink>
              </div>
            </InfoBox>
          </CardBody>
        </Card>
      )}
      
      {step === 2 && (
        <Card theme={theme}>
          <CardHeader theme={theme}>
            <CardTitle theme={theme}>
              <FaEye /> Xem trước và kiểm tra dữ liệu
            </CardTitle>
            <div>
              <ValidationBadge valid={validationResults.isValid} theme={theme}>
                {validationResults.isValid 
                  ? <><FaCheck /> Hợp lệ</> 
                  : <><FaTimes /> Có lỗi</>}
              </ValidationBadge>
            </div>
          </CardHeader>
          <CardBody>
            {questions.length > 0 ? (
              <>
                <div>
                  <strong>Tổng số câu hỏi:</strong> {questions.length}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <span>
                      <ValidationBadge valid={true} theme={theme}>
                        <FaCheck /> {validationResults.validCount} hợp lệ
                      </ValidationBadge>
                    </span>
                    <span>
                      <ValidationBadge valid={false} theme={theme}>
                        <FaTimes /> {validationResults.invalidCount} không hợp lệ
                      </ValidationBadge>
                    </span>
                  </div>
                </div>
                
                {validationResults.errors.length > 0 && (
                  <div style={{ margin: '1rem 0' }}>
                    <ValidationMessage error theme={theme}>
                      Vui lòng sửa các lỗi sau trong file Excel và tải lên lại:
                    </ValidationMessage>
                    <ul>
                      {validationResults.errors.slice(0, 5).map((error, index) => (
                        <ValidationMessage key={index} error theme={theme}>
                          Dòng {error.row}: {error.errors.join(', ')}
                        </ValidationMessage>
                      ))}
                      {validationResults.errors.length > 5 && (
                        <ValidationMessage error theme={theme}>
                          ...và {validationResults.errors.length - 5} lỗi khác
                        </ValidationMessage>
                      )}
                    </ul>
                  </div>
                )}
                
                <PreviewTable>
                  <Table theme={theme}>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Môn học</th>
                        <th>Nội dung câu hỏi</th>
                        <th>Độ khó</th>
                        <th>Đáp án A</th>
                        <th>Đáp án B</th>
                        <th>Đáp án C</th>
                        <th>Đáp án D</th>
                        <th>Đáp án đúng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.slice(0, 10).map((question, index) => {
                        const isRowValid = !validationResults.errors.some(err => err.row === question.index + 1);
                        return (
                          <tr key={index}>
                            <td>{question.index}</td>
                            <td>{question.subject || <span style={{ color: 'red' }}>Thiếu</span>}</td>
                            <td>{question.content || <span style={{ color: 'red' }}>Thiếu</span>}</td>
                            <td>{question.difficulty}</td>
                            <td>{question.optionA || <span style={{ color: 'red' }}>Thiếu</span>}</td>
                            <td>{question.optionB || <span style={{ color: 'red' }}>Thiếu</span>}</td>
                            <td>{question.optionC}</td>
                            <td>{question.optionD}</td>
                            <td>
                              {question.correctAnswer 
                                ? ['A', 'B', 'C', 'D'].includes(question.correctAnswer.toUpperCase().trim())
                                  ? question.correctAnswer.toUpperCase().trim()
                                  : <span style={{ color: 'red' }}>Không hợp lệ</span>
                                : <span style={{ color: 'red' }}>Thiếu</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </PreviewTable>
                
                {questions.length > 10 && (
                  <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: theme === 'dark' ? '#a0aec0' : '#718096' }}>
                    Hiển thị 10/{questions.length} câu hỏi
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <FaQuestionCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Không có dữ liệu câu hỏi nào được tìm thấy trong file.</p>
                <Button 
                  primary
                  onClick={handleRestart}
                  style={{ marginTop: '1rem', display: 'inline-flex' }}
                >
                  <FaUpload /> Tải lên file khác
                </Button>
              </div>
            )}
          </CardBody>
          <CardFooter theme={theme}>
            <Button theme={theme} onClick={handleRestart}>
              <FaTimes /> Hủy
            </Button>
            <Button 
              primary 
              onClick={handleImport}
              disabled={!validationResults.isValid || validationResults.validCount === 0}
            >
              <FaSave /> Nhập câu hỏi
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {step === 3 && (
        <Card theme={theme}>
          <CardHeader theme={theme}>
            <CardTitle theme={theme}>
              <FaSave /> Đang nhập câu hỏi
            </CardTitle>
          </CardHeader>
          <CardBody>
            {importing ? (
              <ImportProgress>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <LoadingSpinner size={48} />
                  <p style={{ marginTop: '1rem' }}>Đang nhập câu hỏi vào hệ thống...</p>
                </div>
                <ProgressBar progress={importProgress} theme={theme} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span>0%</span>
                  <span>{importProgress}%</span>
                  <span>100%</span>
                </div>
              </ImportProgress>
            ) : importResults && (
              <Summary theme={theme}>
                <SummaryTitle theme={theme}>Kết quả nhập câu hỏi</SummaryTitle>
                <SummaryRow theme={theme}>
                  <SummaryLabel theme={theme}>Tổng số câu hỏi</SummaryLabel>
                  <SummaryValue theme={theme}>{importResults.total}</SummaryValue>
                </SummaryRow>
                <SummaryRow theme={theme}>
                  <SummaryLabel theme={theme}>Đã nhập thành công</SummaryLabel>
                  <SummaryValue theme={theme}>{importResults.imported}</SummaryValue>
                </SummaryRow>
                <SummaryRow theme={theme}>
                  <SummaryLabel theme={theme}>Không nhập được</SummaryLabel>
                  <SummaryValue theme={theme}>{importResults.failed}</SummaryValue>
                </SummaryRow>
                
                <SummaryResult success={importResults.success} theme={theme}>
                  {importResults.success 
                    ? <><FaCheck /> {importResults.message}</> 
                    : <><FaTimes /> {importResults.message}</>}
                </SummaryResult>
              </Summary>
            )}
          </CardBody>
          <CardFooter theme={theme}>
            {importResults && importResults.success ? (
              <>
                <Button theme={theme} onClick={handleRestart}>
                  <FaUpload /> Nhập file khác
                </Button>
                <Button primary onClick={handleGoBack}>
                  <FaCheck /> Xong
                </Button>
              </>
            ) : (
              <Button theme={theme} onClick={handleRestart} disabled={importing}>
                <FaTimes /> Hủy
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </Container>
  );
};

export default ImportQuestionsExcel;