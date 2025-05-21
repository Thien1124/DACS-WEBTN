import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaUpload, FaFileExcel, FaDownload } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { importStudentsFromExcel } from '../../services/classroomService';
import * as XLSX from 'xlsx'; // Import XLSX library

const ImportStudentsModal = ({ show, onHide, classroom, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const { theme } = useSelector(state => state.ui);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setValidationError(null);
  };

  const validateFile = () => {
    if (!file) {
      setValidationError('Vui lòng chọn file Excel để nhập danh sách học sinh');
      return false;
    }

    // Check file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      setValidationError('Chỉ chấp nhận file Excel (.xlsx, .xls)');
      return false;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Kích thước file tối đa là 5MB');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFile()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Add client-side file validation before sending to server
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first worksheet
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convert to JSON to check structure
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          // Validate structure
          if (jsonData.length === 0) {
            setError('File Excel không chứa dữ liệu. Vui lòng kiểm tra lại.');
            setLoading(false);
            return;
          }
          
          // Check required columns
          const requiredColumns = ["Username", "Họ và tên", "Email"];
          const fileColumns = Object.keys(jsonData[0]);
          
          const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));
          if (missingColumns.length > 0) {
            setError(`File thiếu các cột bắt buộc: ${missingColumns.join(', ')}. Vui lòng sử dụng mẫu đã cung cấp.`);
            setLoading(false);
            return;
          }
          
          // If validation passes, proceed with import
          await importStudentsFromExcel(classroom, file);
          
          // Call success callback
          if (onSuccess) {
            onSuccess();
          }
          
          // Reset and close modal
          setFile(null);
          onHide();
        } catch (err) {
          console.error('Error processing Excel file:', err);
          setError('Không thể đọc file Excel. File có thể bị hỏng hoặc định dạng không hợp lệ.');
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Không thể đọc file. Vui lòng thử lại với file khác.');
        setLoading(false);
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (err) {
      console.error('Error importing students:', err);
      let errorMessage = 'Vui lòng thử lại sau.';
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại định dạng file.';
        } else if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
        } else if (err.response.status === 409) {
          errorMessage = 'Có học sinh trùng username hoặc email trong hệ thống.';
        } else if (err.response.status >= 500) {
          errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau.';
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage = 'Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng của bạn.';
      }
      
      setError(`Không thể nhập danh sách học sinh. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setError(null);
    setValidationError(null);
    onHide();
  };

  const downloadTemplate = () => {
    // Create a template with the correct headers
    const workbook = XLSX.utils.book_new();
    
    // Define the template headers - only the three required fields
    const templateHeaders = [
      "Username", "Họ và tên", "Email"
    ];
    
    // Create worksheet with headers only
    const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders]);
    
    // Add sample data row - simplified to match the three columns
    const sampleData = ["student1", "Nguyễn Văn A", "nguyenvana@example.com"];
    XLSX.utils.sheet_add_aoa(worksheet, [sampleData], { origin: 1 });
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách học sinh");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `Mau_danh_sach_hoc_sinh_lop_${classroom}.xlsx`);
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      backdrop="static"
      centered
      size="lg"
    >
      <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-white' : ''}>
        <Modal.Title>Nhập danh sách học sinh từ Excel</Modal.Title>
      </Modal.Header>
      <Modal.Body className={theme === 'dark' ? 'bg-dark text-white' : ''}>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h5>Hướng dẫn nhập:</h5>
            <ol>
              <li>Tải xuống tệp mẫu Excel</li>
              <li>Điền thông tin học sinh theo mẫu</li>
              <li>Tải lên tệp đã điền thông tin</li>
              <li>Nhấn "Nhập danh sách" để hoàn tất</li>
            </ol>
            <Button variant="info" onClick={downloadTemplate} className="mt-2">
              <FaDownload /> Tải xuống tệp mẫu Excel
            </Button>
          </div>
          
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Chọn file Excel chứa danh sách học sinh:</Form.Label>
            <Form.Control 
              type="file" 
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              isInvalid={!!validationError}
            />
            <Form.Control.Feedback type="invalid">
              {validationError}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Hỗ trợ định dạng .xlsx, .xls với dung lượng tối đa 5MB
            </Form.Text>
          </Form.Group>
          
          {file && (
            <div className="mb-3">
              <strong>File đã chọn:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
          
          <Alert variant="info">
            <FaFileExcel /> Học sinh sẽ được nhập vào lớp <strong>{classroom}</strong>. Hãy đảm bảo file của bạn đúng định dạng và không trùng mã học sinh.
          </Alert>
        </Form>
      </Modal.Body>
      <Modal.Footer className={theme === 'dark' ? 'bg-dark text-white' : ''}>
        <Button variant="secondary" onClick={handleCancel} disabled={loading}>
          Hủy
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang xử lý...
            </>
          ) : (
            <>
              <FaUpload className="me-2" />
              Nhập danh sách
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportStudentsModal;