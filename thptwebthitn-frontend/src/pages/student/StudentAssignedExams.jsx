import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styled from 'styled-components';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

// Styled Components
const StyledContainer = styled.div`
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
  max-width: 1140px;
  padding-top: 2rem;
  padding-bottom: 2rem;
`;

const PageTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const StyledRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
`;

const StyledCol = styled.div`
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  flex: 0 0 ${props => props.size || '100%'};
  max-width: ${props => props.size || '100%'};
  margin-bottom: 1.5rem;

  @media (min-width: 992px) {
    flex: 0 0 ${props => props.lg || props.size || '100%'};
    max-width: ${props => props.lg || props.size || '100%'};
  }

  @media (min-width: 768px) and (max-width: 991px) {
    flex: 0 0 ${props => props.md || props.size || '100%'};
    max-width: ${props => props.md || props.size || '100%'};
    margin-bottom: ${props => props.mbMd || '1.5rem'};
  }
`;

const FilterCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: ${props => props.theme === 'dark' ? '#343a40' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#212529'};
  background-clip: border-box;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 .125rem .25rem rgba(0,0,0,.075);
`;

const CardBody = styled.div`
  flex: 1 1 auto;
  min-height: 1px;
  padding: 1.25rem;
`;

const SearchForm = styled.form``;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  width: 100%;
`;

const SearchInput = styled.input`
  position: relative;
  flex: 1 1 auto;
  width: 1%;
  min-width: 0;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem 0 0 0.25rem;
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  
  &:focus {
    color: #495057;
    background-color: #fff;
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0 0.25rem 0.25rem 0;
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
  cursor: pointer;
  
  &:hover {
    background-color: #0069d9;
    border-color: #0062cc;
  }
  
  svg {
    margin-right: 0.25rem;
  }
`;

const StatusSelect = styled.select`
  display: block;
  width: 100%;
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  
  &:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const ExamCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  word-wrap: break-word;
  background-color: ${props => props.theme === 'dark' ? '#343a40' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#212529'};
  background-clip: border-box;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
  box-shadow: 0 .125rem .25rem rgba(0,0,0,.075);
`;

const CardHeader = styled.div`
  padding: 0.75rem 1.25rem;
  margin-bottom: 0;
  background-color: ${props => props.theme === 'dark' ? '#2c3136' : 'rgba(0, 0, 0, 0.03)'};
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  strong {
    font-weight: 600;
  }
`;

const CardTitle = styled.h5`
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 500;
`;

const CardText = styled.p`
  margin-top: 0;
  margin-bottom: 1rem;
`;

const BadgeWrapper = styled.span`
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: 0.75em;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
  background-color: ${props => {
    switch(props.type) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'secondary': return '#6c757d';
      case 'info': return '#17a2b8';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'success': return '#fff';
      case 'warning': return '#212529';
      case 'secondary': return '#fff';
      case 'info': return '#fff';
      default: return '#212529';
    }
  }};
`;

const InfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  margin-right: 1.5rem;
  margin-bottom: 0.5rem;
  
  svg {
    margin-right: 0.25rem;
  }
  
  span {
    color: ${props => props.theme === 'dark' ? '#adb5bd' : '#6c757d'};
  }
`;

const CardFooter = styled.div`
  padding: 0.75rem 1.25rem;
  background-color: ${props => props.theme === 'dark' ? '#2c3136' : 'rgba(0, 0, 0, 0.03)'};
  border-top: 1px solid rgba(0, 0, 0, 0.125);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  small {
    font-size: 80%;
    color: ${props => props.theme === 'dark' ? '#adb5bd' : '#6c757d'};
  }
`;

const ActionButton = styled(Link)`
  display: inline-block;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  background-color: ${props => {
    switch(props.variant) {
      case 'primary': return '#007bff';
      case 'info': return '#17a2b8';
      case 'secondary': return '#6c757d';
      default: return '#007bff';
    }
  }};
  color: #fff;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  text-decoration: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.65 : 1};
  
  &:hover {
    background-color: ${props => {
      switch(props.variant) {
        case 'primary': return '#0069d9';
        case 'info': return '#138496';
        case 'secondary': return '#5a6268';
        default: return '#0069d9';
      }
    }};
    color: #fff;
    text-decoration: none;
  }
`;

const DisabledButton = styled.button`
  display: inline-block;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  background-color: #6c757d;
  color: #fff;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  opacity: 0.65;
  cursor: not-allowed;
`;

const EmptyCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: ${props => props.theme === 'dark' ? '#343a40' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#212529'};
  background-clip: border-box;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
  text-align: center;
  padding: 3rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
`;

const StudentAssignedExams = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const navigate = useNavigate();
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchExams();
  }, [isAuthenticated, page, pageSize, statusFilter]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const params = new URLSearchParams();
      params.append('status', statusFilter);
      params.append('page', page);
      params.append('pageSize', pageSize);
      
      const response = await axios.get(`${API_URL}/api/student/exams/assigned?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('API response:', response.data);
      
      if (response.data && response.data.data) {
        setExams(response.data.data);
        setFilteredExams(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setExams([]);
        setFilteredExams([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching assigned exams:', err);
      setError('Không thể tải danh sách bài thi được phân công. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = exams.filter(exam => 
      exam.officialExam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.exam.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExams(filtered);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page when changing filter
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const getStatusBadge = (status, canTakeExam) => {
    switch (status) {
      case 'Đang mở':
        return <BadgeWrapper type="success">Đang mở {canTakeExam && "- Có thể làm bài"}</BadgeWrapper>;
      case 'Chưa mở':
        return <BadgeWrapper type="warning">Chưa mở</BadgeWrapper>;
      case 'Đã đóng':
        return <BadgeWrapper type="secondary">Đã đóng</BadgeWrapper>;
      case 'Đã làm':
        return <BadgeWrapper type="info">Đã làm</BadgeWrapper>;
      default:
        return <BadgeWrapper>Không xác định</BadgeWrapper>;
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <StyledContainer>
      <PageTitle>Bài Thi Được Phân Công</PageTitle>
      
      <FilterCard theme={theme}>
        <CardBody>
          <SearchForm onSubmit={handleSearch}>
            <StyledRow>
              <StyledCol md="50%" lg="33%" mbMd="0">
                <InputGroup>
                  <SearchInput
                    type="text"
                    placeholder="Tìm kiếm bài thi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchButton type="submit">
                    <FaSearch /> Tìm
                  </SearchButton>
                </InputGroup>
              </StyledCol>
              <StyledCol md="33%" lg="25%">
                <StatusSelect 
                  value={statusFilter} 
                  onChange={handleStatusChange}
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang mở</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="not-taken">Chưa làm</option>
                </StatusSelect>
              </StyledCol>
            </StyledRow>
          </SearchForm>
        </CardBody>
      </FilterCard>
      
      {filteredExams.length > 0 ? (
        <>
          <StyledRow>
            {filteredExams.map(exam => (
              <StyledCol key={exam.assignmentId} lg="50%">
                <ExamCard theme={theme}>
                  <CardHeader theme={theme}>
                    <div>
                      <strong>{exam.officialExam.title}</strong>
                    </div>
                    {getStatusBadge(exam.status, exam.canTakeExam)}
                  </CardHeader>
                  <CardBody>
                    <CardTitle>{exam.exam.title}</CardTitle>
                    <CardText>{exam.officialExam.description}</CardText>
                    
                    <InfoRow>
                      <InfoItem theme={theme}>
                        <FaCalendarAlt />
                        <span>Môn học:</span> {exam.exam.subject.name}
                      </InfoItem>
                      <InfoItem theme={theme}>
                        <FaClock />
                        <span>Thời lượng:</span> {exam.exam.duration} phút
                      </InfoItem>
                      <InfoItem theme={theme}>
                        <FaHourglassHalf />
                        <span>Điểm đạt:</span> {exam.exam.passScore}/{exam.exam.totalScore}
                      </InfoItem>
                    </InfoRow>
                    
                    <InfoRow>
                      <InfoItem theme={theme}>
                        <FaCalendarAlt />
                        <span>Bắt đầu:</span> {formatDateTime(exam.officialExam.startTime)}
                      </InfoItem>
                      <InfoItem theme={theme}>
                        <FaCalendarAlt />
                        <span>Kết thúc:</span> {formatDateTime(exam.officialExam.endTime)}
                      </InfoItem>
                    </InfoRow>
                  </CardBody>
                  <CardFooter theme={theme}>
                    <div>
                      <small>Lớp: {exam.officialExam.classroomName}</small>
                    </div>
                    <div>
                      {exam.canTakeExam ? (
                        <ActionButton
                          to={`/student/exams/${exam.officialExam.id}/take`}
                          variant="primary"
                        >
                          Bắt đầu làm bài
                        </ActionButton>
                      ) : exam.hasTaken ? (
                        <ActionButton
                          to={`/student/exams/${exam.officialExam.id}/result`}
                          variant="info"
                        >
                          Xem kết quả
                        </ActionButton>
                      ) : (
                        <DisabledButton disabled>
                          {exam.status === 'Chưa mở' ? 'Chưa đến thời gian thi' : 'Đã kết thúc'}
                        </DisabledButton>
                      )}
                    </div>
                  </CardFooter>
                </ExamCard>
              </StyledCol>
            ))}
          </StyledRow>
          
          {totalPages > 1 && (
            <PaginationContainer>
              <BootstrapPagination>
                <BootstrapPagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
                <BootstrapPagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                
                {[...Array(totalPages)].map((_, i) => (
                  <BootstrapPagination.Item
                    key={i + 1}
                    active={i + 1 === page}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </BootstrapPagination.Item>
                ))}
                
                <BootstrapPagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
                <BootstrapPagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
              </BootstrapPagination>
            </PaginationContainer>
          )}
        </>
      ) : (
        <EmptyCard theme={theme}>
          <p style={{ margin: 0 }}>
            {statusFilter !== 'all' 
              ? 'Không có bài thi nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc.'
              : 'Hiện tại bạn chưa được phân công bài thi nào.'}
          </p>
        </EmptyCard>
      )}
    </StyledContainer>
  );
};

export default StudentAssignedExams;