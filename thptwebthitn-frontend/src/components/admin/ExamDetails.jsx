import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaExclamationTriangle, 
         FaList, FaQuestionCircle, FaRegCheckCircle, FaRegTimesCircle, 
         FaUserAlt, FaEdit, FaPrint, FaCheckCircle, FaTrash, FaCog,
         FaEye, FaEyeSlash } from 'react-icons/fa';
import { getExamWithQuestions } from '../../services/examService';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';
import { removeExam, updateExamDuration, approveExam, updateExamVisibility } from '../../redux/examSlice';
import ConfirmModal from '../common/ConfirmModal';
import UpdateExamDurationModal from '../modals/UpdateExamDurationModal';
import ApproveExamModal from '../modals/ApproveExamModal';
import VisibilityModal from '../modals/VisibilityModal';
import apiClient from '../../services/apiClient';
const ExamDetails = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.ui);
  
  const [activeTab, setActiveTab] = useState('info');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examData, setExamData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Add this near the top of your component body
  const [stateDebug, setStateDebug] = useState({
    lastAction: null,
    updateCount: 0
  });

  // Sửa lại phần useEffect để tải dữ liệu ban đầu
  useEffect(() => {
    const loadExamWithQuestions = async () => {
      try {
        setIsLoading(true);
        
        // Always load the data to ensure we have the latest
        console.log(`Loading exam data for ID: ${examId}`);
        const data = await getExamWithQuestions(examId);
        
        // Log entire response to debug issues
        console.log('Raw API response:', data);
        
        if (data) {
          // Transform data with more comprehensive checks
          const transformedData = {
            ...data,
            // Handle different API response formats for approval status
            isApproved: data.isApproved === true || data.approved === true || data.status === 'approved',
            // Handle different API response formats for active status
            isActive: data.isActive === true || data.status === 'published' || data.status === 'active',
          };
          
          console.log('Transformed exam data:', transformedData);
          setExamData(transformedData);
        } else {
          throw new Error('API returned empty response');
        }
      } catch (err) {
        console.error('Error loading exam details:', err);
        setError(err.message || 'Không thể tải thông tin đề thi');
        showErrorToast('Không thể tải thông tin đề thi');
      } finally {
        setIsLoading(false);
        // Clear update flags after loading
        localStorage.removeItem('examUpdated');
        sessionStorage.removeItem('examDetailUpdated');
      }
    };

    loadExamWithQuestions();
  }, [examId]);

  // Trong component ExamDetails, thêm console.log để kiểm tra
  useEffect(() => {
    if (examData) {
      console.log('Current exam approval status:', examData.isApproved);
    }
  }, [examData]);

  // Add this useEffect for monitoring state changes
  useEffect(() => {
    if (examData) {
      setStateDebug(prev => ({
        ...prev,
        updateCount: prev.updateCount + 1,
        lastUpdate: new Date().toISOString()
      }));
      console.log('Exam data updated:', {
        examId,
        isApproved: examData.isApproved,
        isActive: examData.isActive,
        updateCount: stateDebug.updateCount + 1
      });
    }
  }, [examData]);

  // Xử lý quay lại trang danh sách
  const handleGoBack = () => {
    navigate('/admin/exams');
  };

  // Xử lý chọn tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Xử lý chỉnh sửa
  const handleEdit = () => {
    navigate(`/admin/exams/${examId}/edit`);
  };

  // Xử lý in đề
  const handlePrint = () => {
    window.print();
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteExam = () => {
    dispatch(removeExam(examId))
      .unwrap()
      .then(() => {
        showSuccessToast('Xóa đề thi thành công!');
        setShowDeleteModal(false);
        navigate('/admin/exams');
      })
      .catch(error => {
        showErrorToast(`Lỗi khi xóa đề thi: ${error}`);
        setShowDeleteModal(false);
      });
  };

  const handleEditDuration = () => {
    setShowDurationModal(true);
  };

  const handleApproveExam = (exam) => {
    setShowApproveModal(true);
  };

  const handleUpdateDuration = async (examId, duration) => {
    try {
      console.log(`Updating exam ${examId} duration to ${duration} minutes`);
      await dispatch(updateExamDuration({ examId, duration })).unwrap();
      showSuccessToast('Cập nhật thời gian làm bài thành công!');
      setShowDurationModal(false);
      
      // Tải lại dữ liệu đề thi
      const updatedExam = await getExamWithQuestions(examId);
      setExamData(updatedExam);
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating duration:', error);
      showErrorToast(`Lỗi khi cập nhật thời gian: ${error.message || error}`);
      return Promise.reject(error);
    }
  };

  // Replace the handleApproveSubmit function with this improved version

const handleApproveSubmit = async (examId, comment) => {
  try {
    console.log(`Approving exam ${examId} with comment: ${comment}`);
    
    // Make sure comment is never empty
    const finalComment = comment || "Đề thi đã được duyệt";
    
    // Direct API call with proper structure
    const response = await apiClient.post(`/api/Exam/${examId}/approve`, {
      comment: finalComment
    });
    
    console.log('Approval response:', response);
    
    if (response && response.status === 200) {
      // Update local state immediately to reflect change in UI
      setExamData(prevData => ({
        ...prevData,
        isApproved: true
      }));
      
      // Signal to ExamManagement that data has changed
      localStorage.setItem('examStatusChanged', 'true');
      sessionStorage.setItem('examListNeedsRefresh', 'true');
      
      // Dispatch Redux action to update global state
      dispatch(approveExam({ 
        examId,
        approved: true,
        comment: finalComment,
      }));
      
      showSuccessToast('Đề thi đã được duyệt thành công!');
      setShowApproveModal(false);
      
      // Don't reload data immediately to avoid race conditions
      return true;
    }
    
    throw new Error('API call failed or returned unexpected response');
  } catch (error) {
    console.error('Error approving exam:', error);
    showErrorToast(`Không thể duyệt đề thi: ${error.message || 'Lỗi không xác định'}`);
    return Promise.reject(error);
  }
};

  // Thêm hàm này vào file ExamDetails.jsx
  const getExamDateStatus = (exam) => {
    if (!exam) return 'unknown';
    
    const now = new Date();
    const startTime = exam.startTime ? new Date(exam.startTime) : null;
    const endTime = exam.endTime ? new Date(exam.endTime) : null;
    
    if (endTime && now > endTime) {
      return 'expired'; // Đã hết hạn
    } else if (startTime && now < startTime) {
      return 'upcoming'; // Chưa đến thời gian mở
    } else {
      return 'active'; // Đang trong thời gian hiệu lực
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'expired':
        return 'Đã hết hạn';
      case 'upcoming':
        return 'Chưa đến thời gian mở';
      case 'active':
        return 'Đang trong thời gian hiệu lực';
      default:
        return 'Không xác định';
    }
  };

  // Cập nhật lại hàm xử lý chuyển trạng thái công khai/nháp
const handleVisibilityToggle = () => {
  // Log trạng thái hiện tại
  console.log('Current exam visibility before toggle:', examData?.isActive);
  
  // Use isActive instead of status
  const currentlyPublished = examData?.isActive === true;
  setIsPublishing(!currentlyPublished);
  setShowVisibilityModal(true);
};



// Replace the handleVisibilitySubmit function
const handleVisibilitySubmit = async (examId, makePublic) => {
  try {
    console.log(`Setting exam ${examId} visibility to ${makePublic ? 'public' : 'draft'}`);
    
    // Direct API call with correct structure
    const response = await apiClient.patch(`/api/Exam/${examId}/status`, { 
      isActive: makePublic 
    });
    
    console.log('Visibility update response:', response);
    
    if (response && response.status === 200) {
      // Update local state immediately
      setExamData(prevData => ({
        ...prevData,
        isActive: makePublic
      }));
      
      // Signal to ExamManagement that data has changed
      localStorage.setItem('examStatusChanged', 'true');
      sessionStorage.setItem('examListNeedsRefresh', 'true');
      
      // Update Redux state
      dispatch(updateExamVisibility({ 
        examId, 
        isPublic: makePublic 
      }));
      
      showSuccessToast(makePublic 
        ? 'Đề thi đã được công khai thành công!' 
        : 'Đề thi đã chuyển về trạng thái nháp!');
      
      setShowVisibilityModal(false);
      
      // Don't reload data immediately to avoid race conditions
      return true;
    }
    
    throw new Error('API call failed or returned unexpected response');
  } catch (error) {
    console.error('Error updating visibility:', error);
    showErrorToast(`Lỗi: ${error.message || 'Không thể cập nhật trạng thái'}`);
    return Promise.reject(error);
  }
};

  // Hiển thị loading
  if (isLoading) {
    return (
      <Container>
        <Header>
          <BackButton theme={theme} onClick={handleGoBack}>
            <FaArrowLeft /> Quay lại
          </BackButton>
          <Title theme={theme}>Đang tải thông tin đề thi...</Title>
        </Header>
        <LoadingContainer>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Vui lòng đợi trong giây lát...</p>
        </LoadingContainer>
      </Container>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <Container>
        <Header>
          <BackButton theme={theme} onClick={handleGoBack}>
            <FaArrowLeft /> Quay lại
          </BackButton>
          <Title theme={theme}>Lỗi</Title>
        </Header>
        <ErrorContainer theme={theme}>
          <div className="text-center">
            <FaExclamationTriangle size={48} className="text-danger mb-3" />
            <h3>Không thể tải thông tin đề thi</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          </div>
        </ErrorContainer>
      </Container>
    );
  }

  // Hiển thị không tìm thấy
  if (!examData) {
    return (
      <Container>
        <Header>
          <BackButton theme={theme} onClick={handleGoBack}>
            <FaArrowLeft /> Quay lại
          </BackButton>
          <Title theme={theme}>Không tìm thấy</Title>
        </Header>
        <ErrorContainer theme={theme}>
          <div className="text-center">
            <FaExclamationTriangle size={48} className="text-warning mb-3" />
            <h3>Không tìm thấy đề thi</h3>
            <p>Đề thi với ID <strong>{examId}</strong> không tồn tại hoặc đã bị xóa</p>
            <button className="btn btn-primary" onClick={handleGoBack}>
              Quay lại danh sách đề thi
            </button>
          </div>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton theme={theme} onClick={handleGoBack}>
          <FaArrowLeft /> Quay lại danh sách
        </BackButton>
        <Title theme={theme}>Chi tiết đề thi</Title>
        <div className="d-flex flex-wrap gap-2 ms-auto">
          {/* Nút Quản lý câu hỏi */}
          <ActionButtonNew 
            onClick={() => navigate(`/admin/exams/${examId}/questions`)}
            color="#8b5cf6"
            hoverColor="#7c3aed"
            textColor="#ffffff"
          >
            <FaList /> Quản lý câu hỏi
          </ActionButtonNew>
          
          {/* Nút Chỉnh sửa */}
          <ActionButtonNew 
            onClick={() => navigate(`/admin/exams/${examId}/edit`)}
            color="#3b82f6"
            hoverColor="#2563eb"
            textColor="#ffffff"
          >
            <FaEdit /> Chỉnh sửa
          </ActionButtonNew>
          
          {/* Hiển thị nút Duyệt đề thi nếu chưa được duyệt */}
          {console.log('Rendering approval button, isApproved=', examData?.isApproved)}
          {examData && !examData.isApproved && (
            <ActionButtonNew 
              onClick={() => handleApproveExam(examData)}
              color="#22c55e"
              hoverColor="#16a34a"
              textColor="#ffffff"
            >
              <FaCheckCircle /> Duyệt đề thi
            </ActionButtonNew>
          )}
          
          {/* Nút chuyển đổi trạng thái hiển thị (nháp/công khai) */}
          <ActionButtonNew 
            onClick={handleVisibilityToggle}
            color={examData.isActive ? "#6b7280" : "#3b82f6"}
            hoverColor={examData.isActive ? "#4b5563" : "#2563eb"}
            textColor="#ffffff"
          >
            {examData.isActive 
              ? <><FaEyeSlash /> Không công khai</>
              : <><FaEye /> Công khai</>
            }
          </ActionButtonNew>
          
          {/* Nút Chỉnh sửa thời gian */}
          <ActionButtonNew 
            onClick={() => handleEditDuration(examData)}
            color="#9333ea"
            hoverColor="#7e22ce"
            textColor="#ffffff"
          >
            <FaClock /> Thời gian
          </ActionButtonNew>
          
          {/* Nút Xóa */}
          <ActionButtonNew 
            onClick={() => openDeleteModal()}
            color="#ef4444"
            hoverColor="#dc2626"
            textColor="#ffffff"
          >
            <FaTrash /> Xóa
          </ActionButtonNew>
        </div>
      </Header>

      <DetailCard theme={theme}>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="m-0">{examData.title}</h2>
            <div className="d-flex flex-column align-items-end">
  {/* Trạng thái duyệt */}
  <div className="mb-1">
    <span 
      className={`badge px-3 py-2 d-flex align-items-center gap-1 ${
        examData.isApproved ? 'bg-success' : 'bg-warning'
      }`}
      style={{ fontSize: '0.85rem' }}
    >
      {examData.isApproved ? (
        <>
          <FaCheckCircle /> Đã duyệt
        </>
      ) : (
        <>
          <FaClock /> Chờ duyệt
        </>
      )}
    </span>
  </div>
  
  {/* Trạng thái công khai */}
  <div>
    <span 
      className={`badge px-3 py-2 d-flex align-items-center gap-1 ${
        examData.isActive ? 'bg-primary' : 'bg-secondary'
      }`}
      style={{ fontSize: '0.85rem' }}
    >
      {examData.isActive ? (
        <>
          <FaEye /> Công khai
        </>
      ) : (
        <>
          <FaEyeSlash /> Nháp
        </>
      )}
    </span>
  </div>
</div>

          </div>
        </CardHeader>

        <TabContainer theme={theme}>
          <TabList>
            <Tab 
              isActive={activeTab === 'info'} 
              onClick={() => handleTabChange('info')}
              theme={theme}
            >
              <FaList /> Thông tin chung
            </Tab>
            <Tab 
              isActive={activeTab === 'questions'} 
              onClick={() => handleTabChange('questions')}
              theme={theme}
            >
              <FaQuestionCircle /> Câu hỏi ({examData.questions?.length || 0})
            </Tab>
            <Tab 
              isActive={activeTab === 'settings'} 
              onClick={() => handleTabChange('settings')}
              theme={theme}
            >
              <FaCog /> Cài đặt đề thi
            </Tab>
          </TabList>

          <TabContent theme={theme}>
            {activeTab === 'info' && (
              <div className="info-tab">
                <div className="row">
                  <div className="col-md-6">
                    <InfoSection theme={theme}>
                      <SectionTitle theme={theme}>Thông tin cơ bản</SectionTitle>
                      <InfoItem label="Mã đề" value={examData.id} />
                      <InfoItem label="Thời lượng" value={`${examData.duration} phút`} icon={<FaClock />} />
                      <InfoItem label="Số câu hỏi" value={examData.questionCount} />
                      <InfoItem label="Điểm tối đa" value={examData.totalScore} />
                      <InfoItem label="Điểm đạt" value={examData.passScore} />
                      <InfoItem 
                        label="Người tạo" 
                        value={examData.creator?.fullName || 'Không có thông tin'} 
                        icon={<FaUserAlt />}
                      />
                    </InfoSection>
                  </div>
                  
                  <div className="col-md-6">
                    <InfoSection theme={theme}>
                      <SectionTitle theme={theme}>Thời gian</SectionTitle>
                      <InfoItem 
                        label="Ngày tạo" 
                        value={new Date(examData.createdAt).toLocaleString()} 
                      />
                      <InfoItem 
                        label="Thời gian bắt đầu" 
                        value={examData.startTime ? new Date(examData.startTime).toLocaleString() : 'Không giới hạn'} 
                        icon={<FaCalendarAlt />}
                      />
                      <InfoItem 
                        label="Thời gian kết thúc" 
                        value={examData.endTime ? new Date(examData.endTime).toLocaleString() : 'Không giới hạn'} 
                        icon={<FaCalendarAlt />}
                      />
                      <InfoItem label="Trạng thái" value={examData.status || 'Không xác định'} />
                      <InfoItem label="Số lần làm tối đa" value={examData.maxAttempts || 'Không giới hạn'} />
                    </InfoSection>
                  </div>
                </div>

                <InfoSection theme={theme}>
                  <SectionTitle theme={theme}>Mô tả</SectionTitle>
                  <p>{examData.description || 'Không có mô tả cho đề thi này.'}</p>
                </InfoSection>

                <InfoSection theme={theme}>
                  <SectionTitle theme={theme}>Thống kê loại câu hỏi</SectionTitle>
                  <div className="d-flex flex-wrap gap-3">
                    <StatsItem 
                      label="Trắc nghiệm" 
                      value={examData.questionTypeCounts?.singleChoiceCount || 0} 
                      theme={theme}
                    />
                    <StatsItem 
                      label="Đúng/Sai" 
                      value={examData.questionTypeCounts?.trueFalseCount || 0} 
                      theme={theme}
                    />
                    <StatsItem 
                      label="Trả lời ngắn" 
                      value={examData.questionTypeCounts?.shortAnswerCount || 0} 
                      theme={theme}
                    />
                  </div>
                </InfoSection>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="questions-tab">
                <SectionTitle theme={theme}>
                  Danh sách câu hỏi ({examData.questions?.length || 0})
                </SectionTitle>
                
                {examData.questions && examData.questions.length > 0 ? (
                  examData.questions.map((question, index) => (
                    <QuestionCard key={question.id} theme={theme}>
                      <QuestionHeader theme={theme}>
                        <div className="d-flex justify-content-between align-items-center">
                          <h5>Câu {index + 1} <span className="text-muted">({question.score} điểm)</span></h5>
                          <div>
                            <QuestionType type={question.questionType}>
                              {question.questionType === 1 ? 'Trắc nghiệm' : 
                              question.questionType === 2 ? 'Đúng/Sai' : 
                              question.questionType === 3 ? 'Trả lời ngắn' : 
                              'Khác'}
                            </QuestionType>
                          </div>
                        </div>
                      </QuestionHeader>
                      <QuestionContent>
                        <div dangerouslySetInnerHTML={{ __html: question.content }} />
                        
                        {question.options && question.options.length > 0 && (
                          <div className="mt-3">
                            <h6>Các lựa chọn:</h6>
                            <ul className="list-group">
                              {question.options.map((option, optIndex) => (
                                <li 
                                  key={option.id} 
                                  className={`list-group-item ${
                                    option.isCorrect ? 'list-group-item-success' : ''
                                  }`}
                                >
                                  <div className="d-flex align-items-center">
                                    {option.isCorrect ? (
                                      <FaRegCheckCircle className="text-success me-2" />
                                    ) : (
                                      <FaRegTimesCircle className="text-secondary me-2" />
                                    )}
                                    <div>
                                      <strong>{String.fromCharCode(65 + optIndex)}.</strong>{' '}
                                      <span dangerouslySetInnerHTML={{ __html: option.content }} />
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-light rounded">
                            <h6>Giải thích:</h6>
                            <div dangerouslySetInnerHTML={{ __html: question.explanation }} />
                          </div>
                        )}
                      </QuestionContent>
                    </QuestionCard>
                  ))
                ) : (
                  <EmptyState theme={theme}>
                    <p>Đề thi này chưa có câu hỏi nào.</p>
                    <button className="btn btn-primary" onClick={handleEdit}>
                      Thêm câu hỏi
                    </button>
                  </EmptyState>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="settings-tab">
                <SectionTitle theme={theme}>Cài đặt đề thi</SectionTitle>
                
                <div className="row">
                  <div className="col-md-6">
                    <SettingsList theme={theme}>
                      <SettingItem 
                        label="Hiển thị kết quả sau khi làm bài" 
                        value={examData.showResult} 
                        theme={theme}
                      />
                      <SettingItem 
                        label="Hiển thị đáp án sau khi làm bài" 
                        value={examData.showAnswers} 
                        theme={theme}
                      />
                      <SettingItem 
                        label="Xáo trộn thứ tự câu hỏi" 
                        value={examData.shuffleQuestions} 
                        theme={theme}
                      />
                      <SettingItem 
                        label="Xáo trộn thứ tự đáp án" 
                        value={examData.shuffleOptions} 
                        theme={theme}
                      />
                    </SettingsList>
                  </div>
                  
                  <div className="col-md-6">
                    <SettingsList theme={theme}>
                      <SettingItem 
                        label="Tự động chấm điểm câu trả lời ngắn" 
                        value={examData.autoGradeShortAnswer} 
                        theme={theme}
                      />
                      <SettingItem 
                        label="Cho phép chấm điểm một phần" 
                        value={examData.allowPartialGrading} 
                        theme={theme}
                      />
                    </SettingsList>
                  </div>
                </div>
                
                {examData.scoringConfig && (
                  <InfoSection theme={theme}>
                    <SectionTitle theme={theme}>Cấu hình chấm điểm</SectionTitle>
                    <pre className="bg-light p-3 rounded">
                      {JSON.stringify(JSON.parse(examData.scoringConfig), null, 2)}
                    </pre>
                  </InfoSection>
                )}
              </div>
            )}
          </TabContent>
        </TabContainer>
      </DetailCard>

      {/* Modal Xác nhận xóa */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteExam}
        title="Xác nhận xóa"
        body="Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác."
        confirmText="Xóa đề thi"
        cancelText="Hủy bỏ"
      />

      {/* Modal Cập nhật thời gian làm bài */}
      <UpdateExamDurationModal
        show={showDurationModal}
        onHide={() => setShowDurationModal(false)}
        onSubmit={(newDuration) => handleUpdateDuration(examId, newDuration)}
        examId={examId}
        currentDuration={examData?.duration}
        theme={theme}
      />

      {/* Modal Duyệt đề thi */}
      <ApproveExamModal
        show={showApproveModal}
        onHide={() => setShowApproveModal(false)}
        onSubmit={(comment) => handleApproveSubmit(examId, comment)}
        examId={examId}
        theme={theme}
      />

      {/* Modal Chuyển đổi trạng thái hiển thị */}
      <VisibilityModal
        show={showVisibilityModal}
        onHide={() => setShowVisibilityModal(false)}
        onSubmit={handleVisibilitySubmit}
        examId={examId}
        isPublishing={isPublishing}
        theme={theme}
      />

      {process.env.NODE_ENV === 'development' && (
        <div style={{margin: '20px 0', padding: '10px', border: '1px dashed #ccc'}}>
          <small>Debug: Updates: {stateDebug.updateCount} | Last: {stateDebug.lastAction}</small>
        </div>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0 0 0 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#718096' : '#cbd5e0'};
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.color || (props.theme === 'dark' ? '#2d3748' : '#fff')};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#3182ce'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
`;

const ErrorContainer = styled.div`
  padding: 2rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#fff'};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const DetailCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#fff'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
`;

const SubTitle = styled.div`
  font-size: 1.1rem;
`;

const StatusBadge = styled.span`
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${props => props.isActive ? '#48bb78' : '#a0aec0'};
  color: white;
`;

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.isActive 
    ? (props.theme === 'dark' ? '#90cdf4' : '#3182ce') 
    : (props.theme === 'dark' ? '#a0aec0' : '#718096')};
  font-weight: ${props => props.isActive ? '600' : '400'};
  border-bottom: 2px solid ${props => props.isActive 
    ? (props.theme === 'dark' ? '#90cdf4' : '#3182ce') 
    : 'transparent'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  }
`;

const TabContent = styled.div`
  padding: 2rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#fff'};
`;

const InfoSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const InfoItem = ({ label, value, icon }) => (
  <div className="mb-3">
    <div className="text-muted">{label}:</div>
    <div className="d-flex align-items-center mt-1">
      {icon && <span className="me-2">{icon}</span>}
      <strong>{value}</strong>
    </div>
  </div>
);

const StatsItem = ({ label, value, theme }) => (
  <div 
    className="px-4 py-2 rounded-pill" 
    style={{ 
      backgroundColor: theme === 'dark' ? '#2d3748' : '#e2e8f0',
      color: theme === 'dark' ? '#e2e8f0' : '#2d3748'
    }}
  >
    {label}: <strong>{value}</strong>
  </div>
);

const SettingsList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const SettingItem = ({ label, value, theme }) => (
  <li 
    className="d-flex justify-content-between align-items-center p-2 border-bottom"
    style={{ borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0' }}
  >
    <span>{label}</span>
    <span>
      {typeof value === 'boolean' ? (
        value ? (
          <span className="badge bg-success">Bật</span>
        ) : (
          <span className="badge bg-secondary">Tắt</span>
        )
      ) : (
        value
      )}
    </span>
  </li>
);

const QuestionCard = styled.div`
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const QuestionHeader = styled.div`
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
`;

const QuestionContent = styled.div`
  padding: 1.5rem;
`;

const QuestionType = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  background-color: ${props => {
    switch (props.type) {
      case 1: return '#3182ce'; // Trắc nghiệm - xanh dương
      case 2: return '#805ad5'; // Đúng/Sai - tím
      case 3: return '#dd6b20'; // Trả lời ngắn - cam
      default: return '#718096'; // Mặc định - xám
    }
  }};
  color: white;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
  border: 1px dashed ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
`;

const ActionButtonNew = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  background-color: ${props => props.color};
  color: ${props => props.textColor};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  svg {
    font-size: 1rem;
  }
  
  &:hover {
    background-color: ${props => props.hoverColor};
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
`;

export default ExamDetails;