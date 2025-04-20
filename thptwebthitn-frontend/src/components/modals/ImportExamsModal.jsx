import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFileUpload, FaDownload, FaFileAlt, FaCheck, FaTimes } from 'react-icons/fa';

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
  max-width: 600px;
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

const UploadArea = styled.div`
  border: 2px dashed ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4299e1;
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadIcon = styled(FaFileUpload)`
  font-size: 3rem;
  color: #4299e1;
  margin-bottom: 1rem;
`;

const FileName = styled.div`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  word-break: break-all;
`;

const TemplateLink = styled.a`
  display: flex;
  align-items: center;
  color: #4299e1;
  margin-top: 1rem;
  font-size: 0.875rem;
  gap: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PreviewContainer = styled.div`
  margin: 1.5rem 0;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  overflow: hidden;
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${props => props.theme === 'dark' ? '#3a4966' : '#f7fafc'};
  }
`;

const TableHeader = styled.th`
  padding: 0.75rem;
  text-align: left;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const TableCell = styled.td`
  padding: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
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

const ImportExamsModal = ({ show, onClose, theme, onImport }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef();

  if (!show) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Parse CSV for preview
      parseCSVFile(selectedFile);
    }
  };

  const parseCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n');
      const headers = rows[0].split(',');
      
      const previewRows = [];
      // Get up to 5 rows for preview
      for (let i = 1; i < Math.min(rows.length, 6); i++) {
        if (rows[i].trim()) {
          const values = rows[i].split(',');
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
          });
          previewRows.push(row);
        }
      }
      
      setPreviewData(previewRows);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!file) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onImport(file);
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const downloadTemplate = () => {
    // Create sample CSV content
    const csvContent = "title,description,subjectId,duration,difficulty,isPublic,passingScore\n" +
      "Đề thi Toán học THPT Quốc Gia,Đề thi thử môn Toán chuẩn cấu trúc Bộ GD,1,90,medium,true,5\n" +
      "Đề thi Vật lý học kỳ 1,Đề thi thử môn Vật lý,2,60,easy,true,5";
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'exam_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ModalOverlay>
      <ModalContainer theme={theme}>
        <ModalHeader>
          <ModalTitle theme={theme}>Nhập danh sách đề thi từ CSV</ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <UploadArea theme={theme} onClick={handleUploadClick}>
          <FileInput 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          {!file ? (
            <>
              <UploadIcon />
              <p>Nhấp để chọn file hoặc kéo thả file CSV vào đây</p>
            </>
          ) : (
            <>
              <FaFileAlt size={48} color="#4299e1" />
              <FileName theme={theme}>{file.name}</FileName>
            </>
          )}
        </UploadArea>
        
        <TemplateLink href="#" onClick={(e) => { e.preventDefault(); downloadTemplate(); }}>
          <FaDownload /> Tải mẫu file CSV
        </TemplateLink>
        
        {previewData.length > 0 && (
          <PreviewContainer theme={theme}>
            <h3 style={{ padding: '0.75rem', margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#2d3748' }}>
              Xem trước dữ liệu
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <PreviewTable>
                <TableHead theme={theme}>
                  <TableRow>
                    {Object.keys(previewData[0]).map((header, index) => (
                      <TableHeader key={index} theme={theme}>{header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <TableRow key={rowIndex} theme={theme}>
                      {Object.values(row).map((cell, cellIndex) => (
                        <TableCell key={cellIndex} theme={theme}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </tbody>
              </PreviewTable>
            </div>
          </PreviewContainer>
        )}
        
        <ButtonGroup>
          <Button theme={theme} onClick={onClose}>
            <FaTimes /> Hủy bỏ
          </Button>
          <Button 
            theme={theme} 
            primary 
            onClick={handleImport} 
            disabled={!file || isLoading}
          >
            {isLoading ? 'Đang xử lý...' : <><FaCheck /> Nhập dữ liệu</>}
          </Button>
        </ButtonGroup>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ImportExamsModal;