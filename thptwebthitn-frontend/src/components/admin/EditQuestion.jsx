import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import styled from 'styled-components';

const EditQuestion = ({ questionData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    content: questionData?.content || '',
    explanation: questionData?.explanation || '',
    subjectId: questionData?.subjectId || '',
    chapterId: questionData?.chapterId || '',
    questionLevelId: questionData?.questionLevelId || '',
    questionType: questionData?.questionType || 1, // Mặc định là câu hỏi một đáp án
    tags: questionData?.tags || '',
    suggestedTime: questionData?.suggestedTime || 60,
    defaultScore: questionData?.defaultScore || 1,
    isActive: questionData?.isActive !== false, // Mặc định là active
    scoringConfig: questionData?.scoringConfig || '',
    shortAnswerConfig: questionData?.shortAnswerConfig || '',
    options: questionData?.options || [
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
  });

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questionLevels, setQuestionLevels] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      setIsLoading(true);
      try {
        // Tải danh sách môn học
        const subjectsData = await apiClient.getSubjects();
        setSubjects(subjectsData.items || []);

        // Tải danh sách các mức độ câu hỏi
        const levelsData = await apiClient.getQuestionLevels();
        setQuestionLevels(levelsData || []);

        // Nếu đã có subjectId, tải danh sách chương
        if (formData.subjectId) {
          const chaptersData = await apiClient.getChapters(formData.subjectId);
          setChapters(chaptersData || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [formData.subjectId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;
    setFormData(prev => ({
      ...prev,
      subjectId,
      chapterId: '' // Reset chapterId when subject changes
    }));

    try {
      const chaptersData = await apiClient.getChapters(subjectId);
      setChapters(chaptersData || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách chương:', err);
      setChapters([]);
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleCorrectOption = (index) => {
    // Chỉ cho câu hỏi một đáp án
    if (formData.questionType === 1) {
      const newOptions = formData.options.map((option, i) => ({
        ...option,
        isCorrect: i === index,
        scorePercentage: i === index ? 100 : 0
      }));
      setFormData(prev => ({ ...prev, options: newOptions }));
    } else {
      // Cho câu hỏi trả lời ngắn hoặc đúng/sai, toggle isCorrect
      const newOptions = [...formData.options];
      const isCorrect = !newOptions[index].isCorrect;
      
      newOptions[index] = {
        ...newOptions[index],
        isCorrect: isCorrect,
        scorePercentage: isCorrect ? 100 : 0
      };
      
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const addOption = () => {
    const newIndex = formData.options.length;
    const newLabel = String.fromCharCode(65 + newIndex); // A, B, C, D...
    
    const newOption = {
      content: '',
      isCorrect: false,
      orderIndex: newIndex,
      label: newLabel,
      explanation: '',
      matchingValue: '',
      isPartOfTrueFalseGroup: false,
      groupId: 0,
      scorePercentage: 0
    };
    
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      setError('Câu hỏi phải có ít nhất 2 đáp án.');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    // Cập nhật lại orderIndex
    const reindexedOptions = newOptions.map((opt, i) => ({
      ...opt,
      orderIndex: i
    }));
    setFormData(prev => ({ ...prev, options: reindexedOptions }));
  };

  const handleTypeChange = (e) => {
    const type = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      questionType: type,
      options: type === 5 
        ? [ // Khởi tạo 4 đáp án cho dạng đúng sai nhiều ý
            { content: 'Mệnh đề 1', isCorrect: true, isPartOfTrueFalseGroup: true, groupId: 1, orderIndex: 0 },
            { content: 'Mệnh đề 2', isCorrect: true, isPartOfTrueFalseGroup: true, groupId: 2, orderIndex: 1 },
            { content: 'Mệnh đề 3', isCorrect: true, isPartOfTrueFalseGroup: true, groupId: 3, orderIndex: 2 },
            { content: 'Mệnh đề 4', isCorrect: true, isPartOfTrueFalseGroup: true, groupId: 4, orderIndex: 3 }
        ]
        : prev.options // Giữ nguyên đáp án cho các dạng khác
    }));
  };

  const validateForm = () => {
    // Kiểm tra các trường bắt buộc
    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi.');
      return false;
    }

    if (!formData.subjectId) {
      setError('Vui lòng chọn môn học.');
      return false;
    }

    if (!formData.questionLevelId) {
      setError('Vui lòng chọn mức độ câu hỏi.');
      return false;
    }

    // Kiểm tra đáp án
    const hasEmptyOption = formData.options.some(option => !option.content.trim());
    if (hasEmptyOption) {
      setError('Vui lòng điền nội dung cho tất cả đáp án.');
      return false;
    }

    // Với câu hỏi một đáp án, cần có một đáp án đúng
    if (formData.questionType === 1) {
      const hasCorrectOption = formData.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        setError('Vui lòng chọn ít nhất một đáp án đúng.');
        return false;
      }
    }

    // Với câu hỏi trả lời ngắn, cần có ít nhất một đáp án đúng
    if (formData.questionType === 3) {
      const hasCorrectOption = formData.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        setError('Cần có ít nhất một đáp án đúng cho câu hỏi trả lời ngắn.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    // Nếu đang chỉnh sửa, thêm ID vào formData
    const finalData = questionData?.id 
      ? { ...formData, id: questionData.id } 
      : formData;

    onSave(finalData);
  };

return (
    <FormContainer>
        <h2>{questionData?.id ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleSubmit}>
            <FormGroup>
                <Label>Nội dung câu hỏi *</Label>
                <Textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Nhập nội dung câu hỏi"
                    required
                />
            </FormGroup>

            <FormGroup>
                <Label>Giải thích câu hỏi</Label>
                <Textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleChange}
                    placeholder="Nhập giải thích cho câu hỏi (hiển thị sau khi làm bài)"
                />
            </FormGroup>

            <FormRow>
                <FormGroup>
                    <Label>Loại câu hỏi *</Label>
                    <Select
                        name="questionType"
                        value={formData.questionType}
                        onChange={handleTypeChange}
                        required
                    >
                        <option value="1">Một đáp án (trắc nghiệm a,b,c,d)</option>
                        <option value="3">Trả lời ngắn</option>
                        <option value="5">Đúng-sai nhiều ý</option>
                    </Select>
                </FormGroup>

                <FormGroup>
                    <Label>Môn học *</Label>
                    <Select
                        name="subjectId"
                        value={formData.subjectId}
                        onChange={handleSubjectChange}
                        required
                        disabled={isLoading}
                    >
                        <option value="">-- Chọn môn học --</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>
                                {subject.name}
                            </option>
                        ))}
                    </Select>
                </FormGroup>
            </FormRow>

            <FormRow>
                <FormGroup>
                    <Label>Chương</Label>
                    <Select
                        name="chapterId"
                        value={formData.chapterId}
                        onChange={handleChange}
                        disabled={isLoading || !formData.subjectId}
                    >
                        <option value="">-- Chọn chương --</option>
                        {chapters.map(chapter => (
                            <option key={chapter.id} value={chapter.id}>
                                {chapter.name}
                            </option>
                        ))}
                    </Select>
                </FormGroup>

                <FormGroup>
                    <Label>Mức độ *</Label>
                    <Select
                        name="questionLevelId"
                        value={formData.questionLevelId}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    >
                        <option value="">-- Chọn mức độ --</option>
                        {questionLevels.map(level => (
                            <option key={level.id} value={level.id}>
                                {level.name}
                            </option>
                        ))}
                    </Select>
                </FormGroup>
            </FormRow>

            <FormRow>
                <FormGroup>
                    <Label>Tags</Label>
                    <Input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="Nhập tags, phân cách bởi dấu phẩy (vd: giới hạn,đạo hàm)"
                    />
                </FormGroup>

                <FormGroup>
                    <Label>Thời gian làm đề xuất (giây)</Label>
                    <Input
                        type="number"
                        name="suggestedTime"
                        value={formData.suggestedTime}
                        onChange={handleChange}
                        min="5"
                    />
                </FormGroup>
            </FormRow>

            <FormRow>
                <FormGroup>
                    <Label>Điểm mặc định</Label>
                    <Input
                        type="number"
                        name="defaultScore"
                        value={formData.defaultScore}
                        onChange={handleChange}
                        min="0.1"
                        max="10"
                        step="0.1"
                    />
                </FormGroup>

                <FormGroup>
                    <CheckboxLabel>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                        Kích hoạt câu hỏi
                    </CheckboxLabel>
                </FormGroup>
            </FormRow>

            <OptionsSection>
                <OptionsSectionHeader>
                    <h3>Đáp án *</h3>
                    {formData.questionType !== 5 && (
                        <AddOptionButton type="button" onClick={addOption}>
                            + Thêm đáp án
                        </AddOptionButton>
                    )}
                </OptionsSectionHeader>

                {formData.options.map((option, index) => (
                    <OptionRow key={index}>
                        {formData.questionType === 1 ? (
                            // Multiple choice - one correct answer
                            <RadioButton
                                type="radio"
                                name="correctOption"
                                checked={option.isCorrect}
                                onChange={() => handleCorrectOption(index)}
                                id={`option_${index}`}
                            />
                        ) : formData.questionType === 3 ? (
                            // Short answer - multiple correct answers possible
                            <Checkbox
                                type="checkbox"
                                checked={option.isCorrect}
                                onChange={() => handleCorrectOption(index)}
                                id={`option_${index}`}
                            />
                        ) : (
                            // True/False with multiple parts
                            <Checkbox
                                type="checkbox"
                                checked={option.isCorrect}
                                onChange={() => handleCorrectOption(index)}
                                id={`option_${index}`}
                            />
                        )}

                        <OptionInput
                            type="text"
                            value={option.content}
                            onChange={(e) => handleOptionChange(index, 'content', e.target.value)}
                            placeholder={formData.questionType === 5 
                                ? `Mệnh đề ${index + 1} (đúng/sai)` 
                                : `Đáp án ${index + 1}`
                            }
                            required
                        />
                        
                        {formData.questionType !== 5 && (
                            <RemoveOptionButton 
                                type="button" 
                                onClick={() => removeOption(index)}
                                disabled={formData.options.length <= 2}
                            >
                                &times;
                            </RemoveOptionButton>
                        )}
                    </OptionRow>
                ))}
            </OptionsSection>

            <ButtonGroup>
                <CancelButton type="button" onClick={onCancel}>
                    Hủy
                </CancelButton>
                <SubmitButton type="submit">
                    {questionData?.id ? 'Cập nhật' : 'Tạo mới'}
                </SubmitButton>
            </ButtonGroup>
        </form>
    </FormContainer>
);
};

// Styled components
const FormContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: 28px;
`;

const OptionsSection = styled.div`
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
`;

const OptionsSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  h3 {
    margin: 0;
  }
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
`;

const RadioButton = styled.input`
  margin-right: 5px;
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const Checkbox = styled.input`
  margin-right: 5px;
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const OptionInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const RemoveOptionButton = styled.button`
  background: none;
  border: none;
  color: #ff5555;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const AddOptionButton = styled.button`
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background: #e7e7e7;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`;

const SubmitButton = styled(Button)`
  background-color: #4caf50;
  color: white;
  border: none;
  
  &:hover {
    background-color: #45a049;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  background-color: #ffeaea;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
`;

export default EditQuestion;