import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { FaFilePdf, FaFileExcel, FaChevronLeft, FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import apiClient from '../../services/apiClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const ExamReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  
  useEffect(() => {
    fetchExamReport();
  }, [id]);
  
  const fetchExamReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/api/reports/exams/${id}`);
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching exam report:', err);
      setError('Không thể tải báo cáo kỳ thi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Export to PDF
  const exportToPDF = async () => {
    try {
      const reportElement = document.getElementById('exam-report-container');
      const canvas = await html2canvas(reportElement);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`bao-cao-ky-thi-${id}.pdf`);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      alert('Có lỗi khi xuất báo cáo PDF');
    }
  };
  
  // Export to Excel
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Exam info sheet
      const examInfoData = [
        ['Thông tin kỳ thi', ''],
        ['ID', reportData.examInfo.id],
        ['Tiêu đề', reportData.examInfo.title],
        ['Mô tả', reportData.examInfo.description],
        ['Đề thi', reportData.examInfo.examTitle],
        ['Môn học', reportData.examInfo.subjectName],
        ['Lớp', reportData.examInfo.classroomName],
        ['Thời gian bắt đầu', format(new Date(reportData.examInfo.startTime), 'dd/MM/yyyy HH:mm')],
        ['Thời gian kết thúc', format(new Date(reportData.examInfo.endTime), 'dd/MM/yyyy HH:mm')],
        ['Điểm đạt', reportData.examInfo.passScore],
        ['Trạng thái', reportData.examInfo.status],
        ['', ''],
        ['Thống kê', ''],
        ['Tổng số học sinh', reportData.statistics.totalStudents],
        ['Số lượt hoàn thành', reportData.statistics.completedCount],
        ['Số lượt đạt', reportData.statistics.passedCount],
        ['Tỷ lệ hoàn thành', `${reportData.statistics.completionRate}%`],
        ['Tỷ lệ đạt', `${reportData.statistics.passRate}%`],
        ['Điểm trung bình', reportData.statistics.averageScore],
        ['Điểm cao nhất', reportData.statistics.highestScore],
        ['Điểm thấp nhất', reportData.statistics.lowestScore],
      ];
      
      // Student results sheet
      const studentsData = [
        ['ID', 'Họ tên', 'Mã học sinh', 'Đã thi', 'Điểm số', 'Tỷ lệ %', 'Đạt/Không đạt', 'Thời gian hoàn thành'],
        ...reportData.students.map(student => [
          student.studentId,
          student.studentName,
          student.studentCode,
          student.hasTaken ? 'Đã thi' : 'Chưa thi',
          student.score !== null ? student.score : '',
          student.percentageScore !== null ? `${student.percentageScore}%` : '',
          student.isPassed !== null ? (student.isPassed ? 'Đạt' : 'Không đạt') : '',
          student.completedAt ? format(new Date(student.completedAt), 'dd/MM/yyyy HH:mm:ss') : ''
        ])
      ];
      
      // Add sheets to workbook
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(examInfoData), 'Thông tin kỳ thi');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(studentsData), 'Kết quả học sinh');
      
      // Save file
      XLSX.writeFile(wb, `bao-cao-ky-thi-${id}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Có lỗi khi xuất báo cáo Excel');
    }
  };
  
  // Prepare data for charts
  const getScoreDistributionChart = () => {
    if (!reportData || !reportData.statistics || !reportData.statistics.scoreDistribution) return null;
    
    const labels = Object.keys(reportData.statistics.scoreDistribution);
    const data = Object.values(reportData.statistics.scoreDistribution);
    
    return {
      labels,
      datasets: [
        {
          label: 'Số học sinh',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(201, 203, 207, 0.7)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 1
        }
      ]
    };
  };
  
  const getCompletionChart = () => {
    if (!reportData || !reportData.statistics) return null;
    
    return {
      labels: ['Đã làm bài', 'Chưa làm bài'],
      datasets: [
        {
          data: [
            reportData.statistics.completedCount,
            reportData.statistics.totalStudents - reportData.statistics.completedCount
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(201, 203, 207, 0.7)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 1
        }
      ]
    };
  };
  
  const getPassRateChart = () => {
    if (!reportData || !reportData.statistics || reportData.statistics.completedCount === 0) return null;
    
    return {
      labels: ['Đạt', 'Không đạt'],
      datasets: [
        {
          data: [
            reportData.statistics.passedCount,
            reportData.statistics.completedCount - reportData.statistics.passedCount
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 99, 132, 0.7)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.5)',
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
          <p className="mt-3">Đang tải báo cáo kỳ thi...</p>
        </div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="mt-4 mb-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/admin/reports')}>
          <FaChevronLeft className="me-1" /> Quay lại danh sách báo cáo
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="mt-4 mb-5" fluid>
      {/* Back button */}
      <Button variant="secondary" className="mb-3" onClick={() => navigate('/admin/reports')}>
        <FaChevronLeft className="me-1" /> Quay lại danh sách báo cáo
      </Button>
      
      {reportData && (
        <div id="exam-report-container">
          <h2 className="mb-4 text-center">Báo Cáo Chi Tiết Kỳ Thi</h2>
          
          {/* Export buttons */}
          <div className="d-flex justify-content-end mb-4">
            <Button variant="success" className="me-2" onClick={exportToExcel}>
              <FaFileExcel className="me-1" /> Xuất Excel
            </Button>
            <Button variant="danger" onClick={exportToPDF}>
              <FaFilePdf className="me-1" /> Xuất PDF
            </Button>
          </div>
          
          {/* Exam info */}
          <Row className="mb-4">
            <Col md={6}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-3">
                <Card.Body>
                  <h4 className="mb-3">Thông tin kỳ thi</h4>
                  <Table borderless size="sm" variant={theme === 'dark' ? 'dark' : 'light'}>
                    <tbody>
                      <tr>
                        <th style={{ width: '150px' }}>ID:</th>
                        <td>{reportData.examInfo.id}</td>
                      </tr>
                      <tr>
                        <th>Tiêu đề:</th>
                        <td>{reportData.examInfo.title}</td>
                      </tr>
                      <tr>
                        <th>Đề thi:</th>
                        <td>{reportData.examInfo.examTitle}</td>
                      </tr>
                      <tr>
                        <th>Môn học:</th>
                        <td>{reportData.examInfo.subjectName} ({reportData.examInfo.subjectCode})</td>
                      </tr>
                      <tr>
                        <th>Lớp:</th>
                        <td>{reportData.examInfo.classroomName}</td>
                      </tr>
                      <tr>
                        <th>Thời gian mở:</th>
                        <td>{format(new Date(reportData.examInfo.startTime), 'dd/MM/yyyy HH:mm')}</td>
                      </tr>
                      <tr>
                        <th>Thời gian đóng:</th>
                        <td>{format(new Date(reportData.examInfo.endTime), 'dd/MM/yyyy HH:mm')}</td>
                      </tr>
                      <tr>
                        <th>Điểm đạt:</th>
                        <td>{reportData.examInfo.passScore}</td>
                      </tr>
                      <tr>
                        <th>Trạng thái:</th>
                        <td>
                          <span className={`badge ${
                            reportData.examInfo.status === 'Đang mở' ? 'bg-success' : 
                            reportData.examInfo.status === 'Đã đóng' ? 'bg-danger' :
                            'bg-warning'
                          }`}>
                            {reportData.examInfo.status}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-3">
                <Card.Body>
                  <h4 className="mb-3">Thống kê</h4>
                  <Row>
                    <Col md={6}>
                      <Card bg={theme === 'dark' ? 'secondary' : 'light'} className="text-center mb-3">
                        <Card.Body>
                          <FaUser className="display-5 mb-2" />
                          <h3>{reportData.statistics.totalStudents}</h3>
                          <p className="mb-0">Tổng số học sinh</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card bg={theme === 'dark' ? 'secondary' : 'light'} className="text-center mb-3">
                        <Card.Body>
                          <FaCheck className="display-5 mb-2" />
                          <h3>{reportData.statistics.completedCount}</h3>
                          <p className="mb-0">Hoàn thành</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Table borderless size="sm" variant={theme === 'dark' ? 'dark' : 'light'}>
                    <tbody>
                      <tr>
                        <th style={{ width: '150px' }}>Tỷ lệ hoàn thành:</th>
                        <td>{reportData.statistics.completionRate}%</td>
                      </tr>
                      <tr>
                        <th>Số lượt đạt:</th>
                        <td>{reportData.statistics.passedCount}</td>
                      </tr>
                      <tr>
                        <th>Tỷ lệ đạt:</th>
                        <td>{reportData.statistics.passRate}%</td>
                      </tr>
                      <tr>
                        <th>Điểm trung bình:</th>
                        <td>{reportData.statistics.averageScore}</td>
                      </tr>
                      <tr>
                        <th>Điểm cao nhất:</th>
                        <td>{reportData.statistics.highestScore}</td>
                      </tr>
                      <tr>
                        <th>Điểm thấp nhất:</th>
                        <td>{reportData.statistics.lowestScore}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Charts */}
          <Row className="mb-4">
            <Col md={4}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-3">
                <Card.Body>
                  <h5 className="text-center mb-3">Phân bố điểm số</h5>
                  <div style={{ height: '300px' }}>
                    {getScoreDistributionChart() && 
                      <Bar 
                        data={getScoreDistributionChart()} 
                        options={{ 
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                precision: 0
                              }
                            }
                          }
                        }} 
                      />
                    }
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-3">
                <Card.Body>
                  <h5 className="text-center mb-3">Tỷ lệ hoàn thành</h5>
                  <div style={{ height: '300px' }}>
                    {getCompletionChart() && 
                      <Doughnut 
                        data={getCompletionChart()} 
                        options={{ 
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }} 
                      />
                    }
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-3">
                <Card.Body>
                  <h5 className="text-center mb-3">Tỷ lệ đạt</h5>
                  <div style={{ height: '300px' }}>
                    {getPassRateChart() && 
                      <Pie 
                        data={getPassRateChart()} 
                        options={{ 
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }} 
                      />
                    }
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Student results table */}
          <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4">
            <Card.Body>
              <h4 className="mb-3">Danh sách học sinh</h4>
              <div className="table-responsive">
                <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Họ tên</th>
                      <th>Mã học sinh</th>
                      <th>Trạng thái</th>
                      <th>Điểm số</th>
                      <th>Kết quả</th>
                      <th>Thời gian hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.students.map(student => (
                      <tr key={student.studentId}>
                        <td>{student.studentId}</td>
                        <td>{student.studentName}</td>
                        <td>{student.studentCode}</td>
                        <td>
                          <span className={`badge ${student.hasTaken ? 'bg-success' : 'bg-warning'}`}>
                            {student.hasTaken ? 'Đã làm bài' : 'Chưa làm bài'}
                          </span>
                        </td>
                        <td>
                          {student.score !== null ? 
                            `${student.score} (${student.percentageScore}%)` : 
                            '---'}
                        </td>
                        <td>
                          {student.isPassed !== null && (
                            <span className={`badge ${student.isPassed ? 'bg-success' : 'bg-danger'}`}>
                              {student.isPassed ? 'Đạt' : 'Không đạt'}
                            </span>
                          )}
                        </td>
                        <td>
                          {student.completedAt ? 
                            format(new Date(student.completedAt), 'dd/MM/yyyy HH:mm:ss') : 
                            '---'}
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

export default ExamReportDetail;