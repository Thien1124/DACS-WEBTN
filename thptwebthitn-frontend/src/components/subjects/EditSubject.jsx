import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const EditSubjectForm = styled.form`
  // ... styling
`;

const EditSubject = ({ theme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subjectData, setSubjectData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/Subject/${id}`, subjectData);
      if (response.data) {
        alert('Cập nhật môn học thành công!');
        navigate('/subjects');
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('Có lỗi xảy ra khi cập nhật môn học');
    }
  };

  return (
    <EditSubjectForm onSubmit={handleSubmit}>
      {/* Form fields */}
    </EditSubjectForm>
  );
};

export default EditSubject;