import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const CreateSubjectForm = styled.form`
  // ... styling
`;

const CreateSubject = ({ theme }) => {
  const [subjectData, setSubjectData] = useState({
    name: '',
    description: '',
    status: true
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/Subject', subjectData);
      if (response.data) {
        alert('Tạo môn học thành công!');
        navigate('/subjects');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      alert('Có lỗi xảy ra khi tạo môn học');
    }
  };

  return (
    <CreateSubjectForm onSubmit={handleSubmit}>
      {/* Form fields */}
    </CreateSubjectForm>
  );
};

export default CreateSubject;