import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { FaFilePdf, FaFileExcel, FaSearch, FaChartBar } from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const ReportsDashboard = () => {
  const { theme } = useSelector(state => state.ui);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [classroomFilter, setClassroomFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  
  // Fetch report data
  useEffect(() => {
    fetchReportData();
  }, []);
  
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', format(startDate, 'yyyy-MM-dd'));
      if (endDate) params.append('endDate', format(endDate, 'yyyy-MM-dd'));
      if (classroomFilter) params.append('classroomName', classroomFilter);
      if (subjectFilter) params.append('subjectId', subjectFilter);
      
      const response = await apiClient.get(`/api/reports?${params.toString()}`);
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle date range selection
  const handleDateRangeChange = (event, picker) => {
    setStartDate(picker.startDate.toDate());
    setEndDate(picker.endDate.toDate());
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    fetchReportData();
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setClassroomFilter('');
    setSubjectFilter('');
    fetchReportData();
  };
  
  // Export to PDF
  const exportToPDF = async () => {
    try {
      const reportElement = document.getElementById('report-container');
      const canvas = await html2canvas(reportElement);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save('bao-cao-he-thong.pdf');
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      alert('Có lỗi khi xuất báo cáo PDF');
    }
  };
  
  // Export to Excel
  const exportToExcel = () => {
    try {
      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ['Thống kê tổng quan', ''],
        ['Kỳ thi', reportData.summary.totalExams],
        ['Học sinh được giao', reportData.summary.totalAssignedStudents],
        ['Lượt thi hoàn thành', reportData.summary.totalCompletedExams],
        ['Lượt thi đạt', reportData.summary.totalPassedExams],
        ['Tỷ lệ hoàn thành', `${reportData.summary.overallCompletionRate}%`],
        ['Tỷ lệ đạt', `${reportData.summary.overallPassRate}%`],
      ];
      
      // Exams sheet
      const examsData = [
        ['ID', 'Tiêu đề', 'Môn học', 'Lớp', 'Trạng thái', 'Học sinh', 'Hoàn thành', 'Đạt', 'Tỷ lệ hoàn thành', 'Tỷ lệ đạt'],
        ...reportData.examDetails.map(exam => [
          exam.id,
          exam.title,
          exam.subjectName,
          exam.classroomName,
          exam.status,
          exam.assignedStudents,
          exam.completedExams,
          exam.passedExams,
          `${exam.completionRate}%`,
          `${exam.passRate}%`
        ])
      ];
      
      // Add sheets to workbook
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Tổng quan');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(examsData), 'Danh sách kỳ thi');
      
      // Save file
      XLSX.writeFile(wb, 'bao-cao-he-thong.xlsx');
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Có lỗi khi xuất báo cáo Excel');
    }
  };
  
  // Prepare data for charts
  const getMonthlyChart = () => {
    if (!reportData || !reportData.monthlyStatistics) return null;
    
    return {
      labels: reportData.monthlyStatistics.map(item => `${item.monthName} ${item.year}`),
      datasets: [
        {
          label: 'Số lượng kỳ thi',
          data: reportData.monthlyStatistics.map(item => item.examCount),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Lượt thi hoàn thành',
          data: reportData.monthlyStatistics.map(item => item.completedExams),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Lượt thi đạt',
          data: reportData.monthlyStatistics.map(item => item.passedExams),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    };
  };
  
  const getClassroomChart = () => {
    if (!reportData || !reportData.classroomStatistics) return null;
    
    return {
      labels: reportData.classroomStatistics.map(item => item.classroomName),
      datasets: [
        {
          label: 'Tỷ lệ đạt (%)',
          data: reportData.classroomStatistics.map(item => item.averagePassRate),
          backgroundColor: reportData.classroomStatistics.map(item => 
            item.averagePassRate >= 80 ? 'rgba(75, 192, 192, 0.7)' : 
            item.averagePassRate >= 50 ? 'rgba(255, 205, 86, 0.7)' : 
            'rgba(255, 99, 132, 0.7)'
          ),
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1
        }
      ]
    };
  };
  
  if (loading) {
    return (
      <Container className="mt-4 mb-5">
        <div className="text-center my-5">
          <Spinner animation="border" variant={theme === 'dark' ? 'light' : 'primary'} />
          <p className="mt-3">Đang tải dữ liệu báo cáo...</p>
        </div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="mt-4 mb-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container className="mt-4 mb-5" fluid>
      <h2 className="mb-4 text-center">Báo Cáo Tổng Quan Hệ Thống</h2>
      
      {/* Filters */}
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Khoảng thời gian</Form.Label>
                <DateRangePicker
                  initialSettings={{
                    locale: {
                      format: 'DD/MM/YYYY'
                    }
                  }}
                  onApply={handleDateRangeChange}
                >
                  <Form.Control 
                    type="text" 
                    placeholder="Chọn khoảng thời gian"
                    value={startDate && endDate ? 
                      `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}` : 
                      ''
                    }
                    readOnly
                  />
                </DateRangePicker>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Lớp</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Nhập tên lớp"
                  value={classroomFilter}
                  onChange={e => setClassroomFilter(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Môn học</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Nhập ID môn học"
                  value={subjectFilter}
                  onChange={e => setSubjectFilter(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <div className="d-flex gap-2 mb-3">
                <Button variant="primary" onClick={handleApplyFilters}>
                  <FaSearch className="me-1" /> Lọc
                </Button>
                <Button variant="secondary" onClick={handleResetFilters}>
                  Đặt lại
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Report content */}
      {reportData && (
        <div id="report-container">
          {/* Export buttons */}
          <div className="d-flex justify-content-end mb-4">
            <Button variant="success" className="me-2" onClick={exportToExcel}>
              <FaFileExcel className="me-1" /> Xuất Excel
            </Button>
            <Button variant="danger" onClick={exportToPDF}>
              <FaFilePdf className="me-1" /> Xuất PDF
            </Button>
          </div>
          
          {/* Summary cards */}
          <Row className="mb-4">
            <Col md={2}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="text-center mb-3">
                <Card.Body>
                  <h3>{reportData.summary.totalExams}</h3>
                  <p className="mb-0">Kỳ thi</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="text-center mb-3">
                <Card.Body>
                  <h3>{reportData.summary.totalAssignedStudents}</h3>
                  <p className="mb-0">Học sinh</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="text-center mb-3">
                <Card.Body>
                  <h3>{reportData.summary.totalCompletedExams}</h3>
                  <p className="mb-0">Lượt thi</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="text-center mb-3">
                <Card.Body>
                  <h3>{reportData.summary.totalPassedExams}</h3>
                  <p className="mb-0">Lượt đạt</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="text-center mb-3">
                <Card.Body>
                  <h3>{reportData.summary.overallCompletionRate}%</h3>
                  <p className="mb-0">Tỷ lệ hoàn thành</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="text-center mb-3">
                <Card.Body>
                  <h3>{reportData.summary.overallPassRate}%</h3>
                  <p className="mb-0">Tỷ lệ đạt</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Charts */}
          <Row className="mb-4">
            <Col md={6}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-3">
                <Card.Body>
                  <h5 className="text-center mb-3">Thống kê theo tháng</h5>
                  <div style={{ height: '350px' }}>
                    {getMonthlyChart() && <Bar data={getMonthlyChart()} options={{ maintainAspectRatio: false }} />}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-3">
                <Card.Body>
                  <h5 className="text-center mb-3">Tỷ lệ đạt theo lớp</h5>
                  <div style={{ height: '350px' }}>
                    {getClassroomChart() && <Bar data={getClassroomChart()} options={{ maintainAspectRatio: false }} />}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Exam details table */}
          <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Danh sách kỳ thi</h5>
              <div className="table-responsive">
                <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tiêu đề</th>
                      <th>Môn học</th>
                      <th>Lớp</th>
                      <th>Trạng thái</th>
                      <th>Học sinh</th>
                      <th>Hoàn thành</th>
                      <th>Đạt</th>
                      <th>Tỷ lệ</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.examDetails.map(exam => (
                      <tr key={exam.id}>
                        <td>{exam.id}</td>
                        <td>{exam.title}</td>
                        <td>{exam.subjectName}</td>
                        <td>{exam.classroomName}</td>
                        <td>
                          <span className={`badge ${
                            exam.status === 'Đang mở' ? 'bg-success' : 
                            exam.status === 'Đã đóng' ? 'bg-danger' :
                            'bg-warning'
                          }`}>
                            {exam.status}
                          </span>
                        </td>
                        <td>{exam.assignedStudents}</td>
                        <td>{exam.completedExams}</td>
                        <td>{exam.passedExams}</td>
                        <td>{exam.passRate}%</td>
                        <td>
                          <Link to={`/admin/reports/exams/${exam.id}`} className="btn btn-sm btn-primary">
                            <FaChartBar /> Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </Container>
  );
};

export default ReportsDashboard;