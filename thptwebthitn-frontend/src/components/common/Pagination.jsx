import React from 'react';
import styled from 'styled-components';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
`;

const PageButton = styled.button`
  padding: 0.5rem 0.75rem;
  margin: 0 0.25rem;
  border: ${props => props.theme === 'dark' ? '1px solid #4a5568' : '1px solid #e2e8f0'};
  background-color: ${props => props.active 
    ? (props.theme === 'dark' ? '#4285f4' : '#4285f4')
    : (props.theme === 'dark' ? '#2d2d2d' : 'white')
  };
  color: ${props => props.active 
    ? 'white' 
    : (props.theme === 'dark' ? '#a0aec0' : '#718096')
  };
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active || props.disabled
      ? ''
      : (props.theme === 'dark' ? '#4a5568' : '#e2e8f0')
    };
  }
`;

const PageInfo = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.9rem;
`;

const Pagination = ({ currentPage, totalPages, onPageChange, theme }) => {
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };
  
  // Tạo mảng các trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Số lượng nút trang tối đa hiển thị
    
    if (totalPages <= maxPagesToShow) {
      // Nếu tổng số trang ít hơn hoặc bằng số trang tối đa, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Nếu tổng số trang nhiều hơn, tính toán các trang cần hiển thị
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Thêm dấu "..." nếu cần
      if (startPage > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }
      
      if (endPage < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <PaginationContainer>
      <PageButton
        theme={theme}
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Trước
      </PageButton>
      
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <PageInfo key={`ellipsis-${index}`} theme={theme}>...</PageInfo>
        ) : (
          <PageButton
            key={page}
            theme={theme}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </PageButton>
        )
      ))}
      
      <PageButton
        theme={theme}
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Sau
      </PageButton>
    </PaginationContainer>
  );
};

export default Pagination;