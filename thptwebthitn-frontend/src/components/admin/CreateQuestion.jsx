import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import apiClient from '../../services/apiClient';
import EditQuestion from '../../components/admin/EditQuestion';
import { toast } from 'react-toastify'; // Thay thế import message từ antd


const CreateQuestion = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // Khởi tạo câu hỏi mới với cấu trúc phù hợp với API
  const initialQuestionData = {
    content: '',
    explanation: '',
    subjectId: '',
    chapterId: '',
    questionLevelId: '',
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
        orderIndex: 0,
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
        orderIndex: 1,
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
        orderIndex: 2,
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
        orderIndex: 3,
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
        // Thêm examId nếu đang thêm câu hỏi vào một đề thi cụ thể
        ...(examId && { examId })
      };
      
      // Xử lý options
      questionData.options = questionData.options.map((option, index) => ({
        ...option,
        label: String.fromCharCode(65 + index), // A, B, C, D...
        scorePercentage: option.isCorrect ? 100 : 0,
        orderIndex: index + 1 // Đảm bảo orderIndex từ 1
      }));
      
      // Gọi API tạo câu hỏi mới
      await apiClient.createQuestion(questionData);
      
      toast.success('Tạo câu hỏi thành công!');
      
      // Điều hướng về trang trước hoặc danh sách câu hỏi
      if (examId) {
        navigate(`/admin/exams/${examId}/questions`);
      } else {
        navigate('/admin/questions');
      }
    } catch (error) {
      console.error('Lỗi khi tạo câu hỏi:', error);
      toast.error('Không thể tạo câu hỏi. Vui lòng thử lại sau.');
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

      <EditQuestion
        questionData={initialQuestionData}
        onSave={handleSaveQuestion}
        onCancel={handleCancel}
      />
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

export default CreateQuestion;