import React from 'react';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  border-left: 4px solid ${props => props.$color || '#4e73df'};
  border-radius: 0.35rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
  
  .card-body {
    padding: 1.25rem;
  }
  
  .card-title {
    text-transform: uppercase;
    color: ${props => props.$color || '#4e73df'};
    font-size: 0.8rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }
  
  .card-value {
    color: #5a5c69;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0;
  }
  
  .card-icon {
    color: #dddfeb;
  }
`;

const StatCard = ({ title, value, icon, color }) => {
  return (
    <StyledCard $color={color}>
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <Card.Title>{title}</Card.Title>
          <Card.Text className="card-value">{value}</Card.Text>
        </div>
        <div className="card-icon">
          {icon}
        </div>
      </Card.Body>
    </StyledCard>
  );
};

export default StatCard;