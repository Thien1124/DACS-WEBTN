import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const ToggleContainer = styled.div`
  // ... styling
`;

const ToggleSubjectStatus = ({ theme }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleToggle = async () => {
    try {
      await axios.patch(`/api/Subject/${id}/toggle-status`);
      alert('Thay đổi trạng thái môn học thành công!');
      navigate('/subjects');
    } catch (error) {
      console.error('Error toggling subject status:', error);
      alert('Có lỗi xảy ra khi thay đổi trạng thái môn học');
    }
  };

  return (
    <ToggleContainer>
      {/* Toggle interface */}
    </ToggleContainer>
  );
};

export default ToggleSubjectStatus;