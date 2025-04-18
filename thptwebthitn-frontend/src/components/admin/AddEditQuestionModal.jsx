import { FaCheck, FaTimes } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '../../contexts/ThemeContext';

const AddEditQuestionModal = ({ question, onSubmit, onClose, isEditMode = false }) => {
    const { theme } = useTheme();
    const [options, setOptions] = useState([
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
    ]);

    useEffect(() => {
        if (isEditMode && question) {
            setOptions(question.options || options);
        }
    }, [question, isEditMode]);

    const validationSchema = Yup.object({
        content: Yup.string().required('Vui lòng nhập nội dung câu hỏi'),
        level: Yup.string().required('Vui lòng chọn độ khó'),
        subjectId: Yup.string().required('Vui lòng chọn môn học'),
        chapterId: Yup.string().required('Vui lòng chọn chương')
    });

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...options];
        newOptions[index][field] = value;
        setOptions(newOptions);
    };

    const handleCorrectAnswerChange = (index) => {
        const newOptions = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index
        }));
        setOptions(newOptions);
    };

    const initialValues = {
        content: isEditMode ? question?.content || '' : '',
        level: isEditMode ? question?.level || 'EASY' : 'EASY',
        subjectId: isEditMode ? question?.subjectId || '' : '',
        chapterId: isEditMode ? question?.chapterId || '' : '',
        explanation: isEditMode ? question?.explanation || '' : ''
    };

    return (
        <ModalContainer>
            <ModalTitle theme={theme}>{isEditMode ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</ModalTitle>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    const hasCorrectAnswer = options.some(opt => opt.isCorrect);
                    const validOptions = options.filter(opt => opt.content.trim() !== '');
                    
                    if (!hasCorrectAnswer) {
                        alert('Vui lòng chọn ít nhất 1 đáp án đúng');
                        setSubmitting(false);
                        return;
                    }
                    
                    if (validOptions.length < 2) {
                        alert('Vui lòng nhập ít nhất 2 đáp án');
                        setSubmitting(false);
                        return;
                    }
                    
                    onSubmit({
                        ...values,
                        options: options.filter(opt => opt.content.trim() !== '')
                    }, setSubmitting);
                }}
            >
                {({ isSubmitting, setFieldValue, values }) => (
                    <StyledForm>
                        <FormGroup>
                            <Label htmlFor="content" theme={theme}>Nội dung câu hỏi:</Label>
                            <ReactQuill
                                theme="snow"
                                value={values.content}
                                onChange={(content) => setFieldValue('content', content)}
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{'list': 'ordered'}, {'list': 'bullet'}],
                                        ['link', 'image', 'formula'],
                                        ['clean']
                                    ]
                                }}
                            />
                            <ErrorMessage name="content" component={ErrorText} />
                        </FormGroup>

                        <OptionsContainer>
                            <Label theme={theme}>Các đáp án:</Label>
                            {options.map((option, index) => (
                                <OptionRow key={index}>
                                    <OptionInput
                                        type="text"
                                        value={option.content}
                                        onChange={(e) => handleOptionChange(index, 'content', e.target.value)}
                                        placeholder={`Đáp án ${index + 1}`}
                                        theme={theme}
                                    />
                                    <CorrectCheckbox>
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={option.isCorrect}
                                            onChange={() => handleCorrectAnswerChange(index)}
                                        />
                                        <span>Đáp án đúng</span>
                                    </CorrectCheckbox>
                                </OptionRow>
                            ))}
                        </OptionsContainer>

                        <TwoColumnLayout>
                            <FormGroup>
                                <Label htmlFor="level" theme={theme}>Độ khó:</Label>
                                <Field as="select" name="level" className="form-control">
                                    <option value="EASY">Dễ</option>
                                    <option value="MEDIUM">Trung bình</option>
                                    <option value="HARD">Khó</option>
                                </Field>
                                <ErrorMessage name="level" component={ErrorText} />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="subjectId" theme={theme}>Môn học:</Label>
                                <Field as="select" name="subjectId" className="form-control">
                                    <option value="">Chọn môn học</option>
                                    {/* Dynamic subject options would go here */}
                                </Field>
                                <ErrorMessage name="subjectId" component={ErrorText} />
                            </FormGroup>
                        </TwoColumnLayout>

                        <FormGroup>
                            <Label htmlFor="chapterId" theme={theme}>Chương:</Label>
                            <Field as="select" name="chapterId" className="form-control">
                                <option value="">Chọn chương</option>
                                {/* Dynamic chapter options would go here */}
                            </Field>
                            <ErrorMessage name="chapterId" component={ErrorText} />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="explanation" theme={theme}>Giải thích:</Label>
                            <ReactQuill
                                theme="snow"
                                value={values.explanation}
                                onChange={(explanation) => setFieldValue('explanation', explanation)}
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, false] }],
                                        ['bold', 'italic', 'underline'],
                                        ['link', 'formula'],
                                        ['clean']
                                    ]
                                }}
                            />
                        </FormGroup>
                        <ButtonContainer>
                            <CancelButton theme={theme} type="button" onClick={onClose}>
                                <FaTimes /> Hủy
                            </CancelButton>
                            <SaveButton type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang lưu...
                                </>
                                ) : (
                                <>
                                    <FaCheck /> {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                                </>
                                )}
                            </SaveButton>
                        </ButtonContainer>
                    </StyledForm>
                )}
            </Formik>
        </ModalContainer>
    );
};

// Styled components
const ModalContainer = styled.div`
    background-color: ${({ theme }) => theme === 'dark' ? '#333' : '#fff'};
    border-radius: 8px;
    padding: 20px;
    width: 100%;
    max-width: 800px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalTitle = styled.h2`
    color: ${({ theme }) => theme === 'dark' ? '#fff' : '#333'};
    margin-bottom: 20px;
    text-align: center;
`;

const StyledForm = styled(Form)`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const FormGroup = styled.div`
    margin-bottom: 15px;
    
    .form-control {
        width: 100%;
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid #ddd;
        background-color: ${({ theme }) => theme === 'dark' ? '#444' : '#fff'};
        color: ${({ theme }) => theme === 'dark' ? '#fff' : '#333'};
    }
    
    .quill {
        margin-bottom: 10px;
    }
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: ${({ theme }) => theme === 'dark' ? '#fff' : '#333'};
`;

const ErrorText = styled.div`
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 5px;
`;

const OptionsContainer = styled.div`
    margin-bottom: 15px;
`;

const OptionRow = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 10px;
`;

const OptionInput = styled.input`
    flex: 1;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: ${({ theme }) => theme === 'dark' ? '#444' : '#fff'};
    color: ${({ theme }) => theme === 'dark' ? '#fff' : '#333'};
`;

const CorrectCheckbox = styled.label`
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
`;

const TwoColumnLayout = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
`;

const CancelButton = styled.button`
    background-color: ${({ theme }) => theme === 'dark' ? '#555' : '#f8f9fa'};
    color: ${({ theme }) => theme === 'dark' ? '#fff' : '#333'};
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    
    &:hover {
        background-color: ${({ theme }) => theme === 'dark' ? '#666' : '#e2e6ea'};
    }
`;

const SaveButton = styled.button`
    background-color: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    &:hover:not(:disabled) {
        background-color: #218838;
    }
`;

export default AddEditQuestionModal;