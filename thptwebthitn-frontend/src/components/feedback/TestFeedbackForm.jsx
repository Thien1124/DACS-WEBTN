import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaPaperPlane, FaBug, FaQuestionCircle, 
  FaExclamationTriangle, FaCommentAlt, FaTimes 
} from 'react-icons/fa';

// Add the missing import for feedbackServices
import feedbackServices from '../../services/feedbackServices';
// Import Redux actions
import { submitFeedback, resetSubmission } from '../../redux/feedbackSlice';

const TestFeedbackForm = ({ testId, questionId = null, onClose, onSuccess }) => {
  const { theme } = useSelector(state => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy trạng thái submission từ redux
  const { loading: submitting, error, success } = useSelector(state => state.feedback.submission);
  
  // Add these state variables for local state management
  const [localSubmitting, setSubmitting] = useState(false);
  const [localError, setError] = useState(null);
  
  const [feedback, setFeedback] = useState({
    content: '',
    feedbackType: 1, // Mặc định là lỗi nội dung
    questionId: questionId
  });
  
  const feedbackTypes = [
    { id: 0, name: 'Lỗi hệ thống', icon: <FaBug /> },
    { id: 1, name: 'Lỗi nội dung', icon: <FaExclamationTriangle /> },
    { id: 2, name: 'Góp ý cải thiện', icon: <FaCommentAlt /> },
    { id: 3, name: 'Câu hỏi khác', icon: <FaQuestionCircle /> }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: name === 'feedbackType' ? parseInt(value) : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.content.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Make a clean copy with proper formatting
      const formattedFeedback = {
        content: feedback.content.trim(),
        feedbackType: Number(feedback.feedbackType),
        // Only include questionId if it's valid
        ...(questionId ? { questionId: Number(questionId) } : {})
      };
      
      console.log('Sending feedback data:', formattedFeedback);
      
      const result = await feedbackServices.submitFeedback(
        Number(testId),
        formattedFeedback
      );
      
      toast.success('Phản hồi của bạn đã được gửi thành công!');
      
      // Reset form
      setFeedback({
        content: '',
        feedbackType: 1,
        questionId: questionId
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close the form if onClose is provided
      if (onClose) {
        onClose();
      }
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           'Không thể gửi phản hồi. Vui lòng thử lại sau.';
                          
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Xử lý khi submit thành công
  useEffect(() => {
    if (success) {
      // Reset form
      setFeedback({
        content: '',
        feedbackType: 1,
        questionId: questionId
      });
      
      // Gọi callback onSuccess nếu được cung cấp
      if (onSuccess) {
        onSuccess();
      }
      
      // Đóng form nếu có onClose
      if (onClose) {
        onClose();
      }
      
      // Reset submission state
      dispatch(resetSubmission());
    }
  }, [success, dispatch, onSuccess, onClose, questionId]);
  
  return (
    <FormContainer 
      theme={theme}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <FormHeader>
        <FormTitle>Gửi phản hồi về bài thi</FormTitle>
        {onClose && (
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        )}
      </FormHeader>
      
      {questionId && (
        <QuestionInfo theme={theme}>
          Phản hồi cho câu hỏi: #{questionId}
        </QuestionInfo>
      )}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label theme={theme}>Loại phản hồi</Label>
          <FeedbackTypeContainer>
            {feedbackTypes.map(type => (
              <FeedbackTypeOption key={type.id} theme={theme}>
                <RadioInput
                  type="radio"
                  name="feedbackType"
                  id={`feedbackType-${type.id}`}
                  value={type.id}
                  checked={feedback.feedbackType === type.id}
                  onChange={handleChange}
                />
                <RadioLabel 
                  htmlFor={`feedbackType-${type.id}`}
                  selected={feedback.feedbackType === type.id}
                  theme={theme}
                >
                  {type.icon} {type.name}
                </RadioLabel>
              </FeedbackTypeOption>
            ))}
          </FeedbackTypeContainer>
        </FormGroup>
        
        <FormGroup>
          <Label theme={theme}>Nội dung phản hồi</Label>
          <TextArea 
            name="content"
            value={feedback.content}
            onChange={handleChange}
            placeholder="Mô tả chi tiết vấn đề bạn gặp phải hoặc góp ý cải thiện..."
            rows={5}
            theme={theme}
            required
          />
        </FormGroup>
        
        {(localError || error) && <ErrorMessage>{localError || error}</ErrorMessage>}
        
        <SubmitButton 
          type="submit"
          disabled={submitting || localSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaPaperPlane /> {(submitting || localSubmitting) ? 'Đang gửi...' : 'Gửi phản hồi'}
        </SubmitButton>
      </Form>
      
      <Disclaimer theme={theme}>
        Phản hồi của bạn sẽ được gửi đến đội ngũ quản trị viên để xử lý. 
        Cảm ơn bạn đã đóng góp để cải thiện chất lượng bài thi.
      </Disclaimer>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const QuestionInfo = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#3b4759' : '#edf2f7'};
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.25rem;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  border-radius: 6px;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : 'inherit'};
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 0.9rem;
  margin-top: -0.5rem;
`;

const SubmitButton = styled(motion.button)`
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const Disclaimer = styled.p`
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  text-align: center;
  margin-top: 1.5rem;
`;

const FeedbackTypeContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FeedbackTypeOption = styled.div`
  position: relative;
`;

const RadioInput = styled.input`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem;
  border-radius: 6px;
  background-color: ${props => props.selected 
    ? (props.theme === 'dark' ? '#4299e1' : '#bee3f8') 
    : (props.theme === 'dark' ? '#4a5568' : '#edf2f7')};
  color: ${props => props.selected 
    ? (props.theme === 'dark' ? 'white' : '#2b6cb0') 
    : (props.theme === 'dark' ? '#e2e8f0' : '#4a5568')};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.selected 
      ? (props.theme === 'dark' ? '#4299e1' : '#bee3f8') 
      : (props.theme === 'dark' ? '#3b4759' : '#e2e8f0')};
  }
`;

export default TestFeedbackForm;