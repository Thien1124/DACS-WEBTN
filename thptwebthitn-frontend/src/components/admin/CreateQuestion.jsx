import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import apiClient from '../../services/apiClient';
import EditQuestion from '../../components/admin/EditQuestion';
import { toast } from 'react-toastify';
import { getAllSubjectsNoPaging } from '../../services/subjectService';

const CreateQuestion = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // Thêm state để quản lý subjects
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState(null);
  
  // Tải danh sách môn học khi component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoadingSubjects(true);
        setSubjectsError(null);
        console.log('Đang tải danh sách môn học...');
        
        // Thêm timeout để tránh các vấn đề race condition
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const data = await getAllSubjectsNoPaging();
        console.log('Đã tải môn học:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          setSubjects(data);
          console.log('Đã cập nhật state subjects:', data.length);
        } else {
          console.error('Định dạng dữ liệu môn học không hợp lệ:', data);
          setSubjectsError('Dữ liệu môn học không đúng định dạng hoặc trống');
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách môn học:', error);
        setSubjectsError(error.message || 'Không thể tải danh sách môn học');
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, []);
  
  // Thêm hàm này để thử lại khi cần
  const retryLoadSubjects = () => {
    setIsLoadingSubjects(true);
    setSubjectsError(null);
    
    getAllSubjectsNoPaging()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSubjects(data);
          console.log('Tải lại môn học thành công:', data.length);
        } else {
          setSubjectsError('Dữ liệu môn học trống hoặc không đúng định dạng');
        }
      })
      .catch(error => {
        console.error('Lỗi khi tải lại môn học:', error);
        setSubjectsError(error.message || 'Không thể tải danh sách môn học');
      })
      .finally(() => {
        setIsLoadingSubjects(false);
      });
  };

  // Khởi tạo câu hỏi mới với cấu trúc phù hợp với API
  const initialQuestionData = {
    content: '',
    explanation: '',
    subjectId: '',
    chapterId: '',
    questionLevelId: 2, // Mặc định mức độ trung bình
    questionType: 1, // Mặc định là câu hỏi một đáp án
    tags: '',
    suggestedTime: 60,
    defaultScore: 1,
    isActive: true,
    scoringConfig: '',
    shortAnswerConfig: '',
    options: [
      { 
        content: '', 
        isCorrect: true, 
        orderIndex: 1,
        label: 'A',
        explanation: '',
        matchingValue: '',
        isPartOfTrueFalseGroup: false,
        groupId: 0,
        scorePercentage: 100
      },
      { 
        content: '', 
        isCorrect: false, 
        orderIndex: 2,
        label: 'B',
        explanation: '',
        matchingValue: '',
        isPartOfTrueFalseGroup: false,
        groupId: 0,
        scorePercentage: 0
      },
      { 
        content: '', 
        isCorrect: false, 
        orderIndex: 3,
        label: 'C',
        explanation: '',
        matchingValue: '',
        isPartOfTrueFalseGroup: false,
        groupId: 0,
        scorePercentage: 0
      },
      { 
        content: '', 
        isCorrect: false, 
        orderIndex: 4,
        label: 'D',
        explanation: '',
        matchingValue: '',
        isPartOfTrueFalseGroup: false,
        groupId: 0,
        scorePercentage: 0
      }
    ]
  };

  // Tạo câu hỏi mới và thêm examId nếu được cung cấp
  const handleSaveQuestion = async (formData) => {
    try {
      // Chuẩn bị dữ liệu để gửi lên API
      const questionData = {
        ...formData,
        subjectId: Number(formData.subjectId), // Đảm bảo subjectId là số
        questionLevelId: Number(formData.questionLevelId || 2), // Đảm bảo questionLevelId là số
        // Thêm examId nếu đang thêm câu hỏi vào một đề thi cụ thể
        ...(examId && { examId: Number(examId) })
      };
      
      // Xử lý options
      questionData.options = questionData.options.map((option, index) => ({
        ...option,
        label: String.fromCharCode(65 + index), // A, B, C, D...
        scorePercentage: option.isCorrect ? 100 : 0,
        orderIndex: index + 1 // Đảm bảo orderIndex từ 1
      }));
      
      console.log('Dữ liệu câu hỏi gửi đi:', questionData);
      
      // Gọi API tạo câu hỏi mới
      const response = await apiClient.post('/api/Question', questionData);
      console.log('Phản hồi từ API:', response);
      
      toast.success('Tạo câu hỏi thành công!');
      
      // Điều hướng về trang trước hoặc danh sách câu hỏi
      if (examId) {
        navigate(`/admin/exams/${examId}/questions`);
      } else {
        navigate('/admin/questions');
      }
    } catch (error) {
      console.error('Lỗi khi tạo câu hỏi:', error);
      const errorMessage = error.response?.data?.detail || 'Không thể tạo câu hỏi. Vui lòng thử lại sau.';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    // Quay lại trang trước
    if (examId) {
      navigate(`/admin/exams/${examId}/questions`);
    } else {
      navigate('/admin/questions');
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <h1>Thêm Câu Hỏi Mới</h1>
        {examId && <p>Thêm vào đề thi ID: {examId}</p>}
      </PageHeader>

      {isLoadingSubjects ? (
        <LoadingContainer>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải danh sách môn học...</p>
        </LoadingContainer>
      ) : subjectsError ? (
        <ErrorContainer>
          <div className="alert alert-danger">
            <strong>Lỗi:</strong> {subjectsError}
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-primary" 
                onClick={retryLoadSubjects}
              >
                Thử tải lại dữ liệu
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary ms-2" 
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </ErrorContainer>
      ) : (
        <EditQuestion
          questionData={initialQuestionData}
          onSave={handleSaveQuestion}
          onCancel={handleCancel}
          subjects={subjects} // Truyền danh sách môn học vào EditQuestion
        />
      )}
    </PageContainer>
  );
};

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #718096;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  
  p {
    margin-top: 1rem;
    color: #4a5568;
  }
`;

const ErrorContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
`;

export default CreateQuestion;