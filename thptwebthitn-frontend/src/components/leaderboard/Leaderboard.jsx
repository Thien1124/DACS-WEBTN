import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';
import styled from 'styled-components';

const RankIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  background-color: ${props => {
    if (props.rank === 1) return '#FFD700'; // gold
    if (props.rank === 2) return '#C0C0C0'; // silver
    if (props.rank === 3) return '#CD7F32'; // bronze
    return '#f8f9fa'; // light gray for others
  }};
  color: ${props => props.rank <= 3 ? '#fff' : '#333'};
`;

const UserRow = styled.tr`
  transition: background-color 0.2s;
  background-color: ${props => props.isCurrentUser ? (props.theme === 'dark' ? '#2c3e50' : '#f0f8ff') : 'transparent'};

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2c3e50' : '#f0f8ff'};
  }
`;

const ScoreCell = styled.td`
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#e9ecef' : '#007bff'};
`;

const DateCell = styled.td`
  color: ${props => props.theme === 'dark' ? '#adb5bd' : '#6c757d'};
  font-size: 0.9rem;
`;

const Leaderboard = ({ title, leaders, currentUserId }) => {
  const { theme } = useSelector(state => state.ui);

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy size={16} />;
    if (rank === 2) return <FaMedal size={16} />;
    if (rank === 3) return <FaAward size={16} />;
    return rank;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card bg={theme === 'dark' ? 'dark' : 'light'} className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{title}</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover variant={theme === 'dark' ? 'dark' : 'light'} className="mb-0">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Xếp hạng</th>
                <th style={{ width: '30%' }}>Học sinh</th>
                <th style={{ width: '20%' }}>Lớp/Trường</th>
                <th style={{ width: '15%' }}>Điểm số</th>
                <th style={{ width: '15%' }}>Thời gian làm bài</th>
                <th style={{ width: '10%' }}>Ngày thi</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader, index) => (
                <UserRow 
                  key={index} 
                  isCurrentUser={leader.userId === currentUserId}
                  theme={theme}
                >
                  <td>
                    <RankIcon rank={index + 1}>
                      {getRankIcon(index + 1)}
                    </RankIcon>
                  </td>
                  <td>
                    {leader.fullName}
                    {leader.userId === currentUserId && (
                      <Badge bg="info" className="ms-2">Bạn</Badge>
                    )}
                  </td>
                  <td>{leader.className || "Không có thông tin"}</td>
                  <ScoreCell theme={theme}>{leader.score.toFixed(2)}</ScoreCell>
                  <td>{leader.duration ? `${Math.floor(leader.duration / 60)}:${(leader.duration % 60).toString().padStart(2, '0')}` : 'N/A'}</td>
                  <DateCell theme={theme}>{formatDate(leader.completedAt)}</DateCell>
                </UserRow>
              ))}
              
              {leaders.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Chưa có dữ liệu bảng xếp hạng
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Leaderboard;