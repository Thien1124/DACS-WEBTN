import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const DeleteConfirmation = styled.div`
  // ... styling
`;

const DeleteSubject = ({ theme }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/Subject/${id}`);
      alert('Xóa môn học thành công!');
      navigate('/subjects');
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Có lỗi xảy ra khi xóa môn học');
    }
  };

  return (
    <DeleteConfirmation>
      {/* Confirmation dialog */}
    </DeleteConfirmation>
  );
};

export default DeleteSubject;