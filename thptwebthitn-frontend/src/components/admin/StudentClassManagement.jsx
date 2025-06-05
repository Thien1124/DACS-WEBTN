import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, FaUserGraduate, FaFileExport, 
  FaCheckCircle, FaDownload, FaSearch, 
  FaFilter, FaSyncAlt, FaSortAmountDown, 
  FaSortAmountUp, FaPrint, FaEye, FaEdit,
  FaGraduationCap, FaSchool, FaIdCard, FaArrowDown,
  FaChartLine, FaExclamationTriangle
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { fetchUsersList } from '../../redux/userSlice';
import { fetchExams, fetchExamResult } from '../../redux/examSlice'; 
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { exportStudentsByClassroom,exportScoresByExam } from '../../services/export';
// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Shared styles
const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const cardStyle = css`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.75rem;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 6px 16px rgba(0, 0, 0, 0.4), 0 3px 8px rgba(0, 0, 0, 0.3)' 
      : '0 6px 24px rgba(0, 0, 0, 0.1), 0 3px 12px rgba(0, 0, 0, 0.05)'};
  }
`;

// Container components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto 4rem;
  padding: 2rem;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const Header = styled.div`
  ${flexBetween}
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeaderContent = styled.div`
  animation: ${slideUp} 0.5s ease-out;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: ${props => props.theme === 'dark' ? '#63b3ed' : '#4299e1'};
  }
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  opacity: 0.9;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  animation: ${slideUp} 0.5s ease-out;
  animation-delay: 0.1s;
  animation-fill-mode: both;
`;

// Button components
const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease-in-out;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 2px 4px rgba(0, 0, 0, 0.2)' 
    : '0 2px 6px rgba(0, 0, 0, 0.08)'};
  background-color: ${props => {
    if (props.primary) return '#4299e1';
    if (props.success) return '#48bb78';
    if (props.warning) return '#ed8936';
    if (props.danger) return '#f56565';
    return props.theme === 'dark' ? '#2d3748' : '#f7fafc';
  }};
  color: ${props => (props.primary || props.success || props.warning || props.danger)
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 4px 8px rgba(0, 0, 0, 0.3)' 
      : '0 4px 10px rgba(0, 0, 0, 0.1)'};
    background-color: ${props => {
      if (props.primary) return '#3182ce';
      if (props.success) return '#38a169';
      if (props.warning) return '#dd6b20';
      if (props.danger) return '#e53e3e';
      return props.theme === 'dark' ? '#4a5568' : '#edf2f7';
    }};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Card components
const Card = styled(motion.div)`
  ${cardStyle}
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  ${flexBetween}
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  flex-wrap: wrap;
  gap: 1rem;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${props => props.theme === 'dark' ? '#63b3ed' : '#4299e1'};
  }
`;

const CardBody = styled.div`
  padding: 1.75rem;
`;

// Filter components
const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#cbd5e0' : '#4a5568'};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 2px 4px rgba(0, 0, 0, 0.2)' 
    : '0 1px 3px rgba(0, 0, 0, 0.05)'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
  
  option {
    padding: 10px;
  }
`;

// Search components
const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 1.75rem;
  width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 2px 6px rgba(0, 0, 0, 0.2)' 
    : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  transition: all 0.2s ease;
  
  &:focus-within {
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 4px 8px rgba(0, 0, 0, 0.3)' 
      : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-right: none;
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
  
  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#718096' : '#a0aec0'};
    font-weight: 400;
  }
`;

const SearchButton = styled.button`
  ${flexCenter}
  padding: 0 1.5rem;
  background: linear-gradient(to right, #4299e1, #3182ce);
  color: white;
  border: none;
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(to right, #3182ce, #2b6cb0);
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

// Stats components
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 0.5rem;
`;

const StatCard = styled.div`
  background: ${props => {
    const type = props.type || '';
    if (props.theme === 'dark') {
      if (type === 'total') return 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)';
      if (type === 'approved') return 'linear-gradient(135deg, #2f855a 0%, #1a202c 100%)';
      if (type === 'pending') return 'linear-gradient(135deg, #9c4221 0%, #1a202c 100%)';
      return 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)';
    } else {
      if (type === 'total') return 'linear-gradient(135deg, #ebf8ff 0%, #ffffff 100%)';
      if (type === 'approved') return 'linear-gradient(135deg, #f0fff4 0%, #ffffff 100%)';
      if (type === 'pending') return 'linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)';
      return 'linear-gradient(135deg, #f7fafc 0%, #ffffff 100%)';
    }
  }};
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 6px rgba(0, 0, 0, 0.2)' 
    : '0 4px 10px rgba(0, 0, 0, 0.05)'};
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 6px 12px rgba(0, 0, 0, 0.25)' 
      : '0 8px 16px rgba(0, 0, 0, 0.08)'};
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 4px;
    bottom: 0;
    left: 0;
    background: ${props => {
      if (props.type === 'total') return 'linear-gradient(to right, #3182ce, #63b3ed)';
      if (props.type === 'approved') return 'linear-gradient(to right, #38a169, #9ae6b4)';
      if (props.type === 'pending') return 'linear-gradient(to right, #dd6b20, #fbd38d)';
      return 'linear-gradient(to right, #a0aec0, #cbd5e0)';
    }};
  }
`;

const StatIcon = styled.div`
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  opacity: 0.15;
  font-size: 2.5rem;
  color: ${props => {
    if (props.type === 'total') return '#3182ce';
    if (props.type === 'approved') return '#38a169';
    if (props.type === 'pending') return '#dd6b20';
    return '#a0aec0';
  }};
`;

const StatLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => {
    if (props.theme === 'dark') {
      if (props.type === 'total') return '#63b3ed';
      if (props.type === 'approved') return '#9ae6b4';
      if (props.type === 'pending') return '#fbd38d';
      return '#e2e8f0';
    } else {
      if (props.type === 'total') return '#2b6cb0';
      if (props.type === 'approved') return '#2f855a';
      if (props.type === 'pending') return '#c05621';
      return '#2d3748';
    }
  }};
  margin-top: 0.75rem;
  display: flex;
  align-items: baseline;
  
  span {
    font-size: 1rem;
    margin-left: 0.5rem;
    opacity: 0.8;
  }
`;
const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const CustomCheckbox = styled.input.attrs({ type: 'checkbox' })`
  cursor: pointer;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  accent-color: ${props => props.theme === 'dark' ? '#4299e1' : '#3182ce'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:focus {
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
    outline: none;
  }
`;
// Enhanced table styling
const TableContainer = styled.div`
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 4px 10px rgba(0, 0, 0, 0.3)' 
    : '0 4px 12px rgba(0, 0, 0, 0.08)'};
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  
  th, td {
    padding: 1rem 1rem;
    text-align: left;
    vertical-align: middle;
  }
  
  th {
    background: ${props => props.theme === 'dark' 
      ? 'linear-gradient(to bottom, #2d3748, #1a202c)' 
      : 'linear-gradient(to bottom, #f8fafc, #f1f5f9)'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#1e293b'};
    position: sticky;
    top: 0;
    z-index: 10;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${props => props.theme === 'dark' 
        ? 'linear-gradient(to bottom, #3f4f68, #2d3748)' 
        : 'linear-gradient(to bottom, #f1f5f9, #e2e8f0)'};
    }
    
    &:first-child {
      border-top-left-radius: 0.5rem;
    }
    
    &:last-child {
      border-top-right-radius: 0.5rem;
    }
  }
  
  /* Column widths */
  th:nth-child(1), td:nth-child(1) { width: 5%; }  /* Checkbox */
  th:nth-child(2), td:nth-child(2) { width: 15%; } /* Mã HS */
  th:nth-child(3), td:nth-child(3) { width: 30%; } /* Họ và tên */
  th:nth-child(4), td:nth-child(4) { width: 10%; } /* Khối */
  th:nth-child(5), td:nth-child(5) { width: 15%; } /* Điểm TB */
  th:nth-child(6), td:nth-child(6) { width: 10%; } /* Trạng thái */
  th:nth-child(7), td:nth-child(7) { width: 15%; } /* Thao tác */
`;


const TableHeader = styled.th`
  position: relative;
  white-space: nowrap;
  padding: 1rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &:after {
    content: '';
    position: absolute;
    right: 0;
    top: 25%;
    height: 50%;
    width: 1px;
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    opacity: 0.6;
  }
  
  &:last-child::after {
    display: none;
  }
  
  .sort-icon {
    display: inline-flex;
    margin-left: 0.5rem;
    font-size: 0.875rem;
    color: ${props => props.theme === 'dark' ? '#63b3ed' : '#3b82f6'};
    opacity: 0.8;
  }
`;


// Enhanced badge for status
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: ${props => {
    if (props.status === 'approved') return props.theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)';
    if (props.status === 'pending') return props.theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)';
    if (props.status === 'failed') return props.theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
    return props.theme === 'dark' ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)';
  }};
  color: ${props => {
    if (props.status === 'approved') return props.theme === 'dark' ? '#34d399' : '#059669';
    if (props.status === 'pending') return props.theme === 'dark' ? '#fbbf24' : '#d97706';
    if (props.status === 'failed') return props.theme === 'dark' ? '#f87171' : '#dc2626';
    return props.theme === 'dark' ? '#d1d5db' : '#4b5563';
  }};
  border: 1px solid ${props => {
    if (props.status === 'approved') return props.theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.2)';
    if (props.status === 'pending') return props.theme === 'dark' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.2)';
    if (props.status === 'failed') return props.theme === 'dark' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.2)';
    return props.theme === 'dark' ? 'rgba(107, 114, 128, 0.4)' : 'rgba(107, 114, 128, 0.2)';
  }};
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: ${props => props.theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme === 'dark' ? '0 2px 5px rgba(0, 0, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.1)'};
  }
`;

// Improved action buttons container
const ActionIcons = styled.div`
  display: flex;
  gap: 0.5rem; /* Reduced gap from 0.75rem */
  justify-content: flex-start;
  flex-wrap: wrap; /* Added to allow wrapping if needed */
`;

// Enhanced action buttons
const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: ${props => props.showText ? '0.4rem 0.7rem' : '0.5rem'};
  width: ${props => props.showText ? 'auto' : '2.5rem'};
  height: ${props => props.showText ? 'auto' : '2.5rem'};
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: ${props => props.showText ? '0.75rem' : '0.8125rem'};
  background-color: ${props => 
    props.view 
      ? props.theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
      : props.edit
        ? props.theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
        : props.theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(243, 244, 246, 0.8)'
  };
  color: ${props => 
    props.view 
      ? props.theme === 'dark' ? '#60a5fa' : '#2563eb'
      : props.edit
        ? props.theme === 'dark' ? '#34d399' : '#059669'
        : props.theme === 'dark' ? '#d1d5db' : '#4b5563'
  };
  border: 1px solid ${props => 
    props.view 
      ? props.theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
      : props.edit
        ? props.theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'
        : props.theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.4)'
  };
  box-shadow: ${props => props.theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.03)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' ? '0 3px 6px rgba(0, 0, 0, 0.3)' : '0 3px 5px rgba(0, 0, 0, 0.08)'};
    background-color: ${props => 
      props.view 
        ? props.theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)'
        : props.edit
          ? props.theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.15)'
          : props.theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.9)'
    };
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  svg {
    font-size: ${props => props.showText ? '0.875rem' : '1rem'};
  }
`;

// Pagination components
const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.75rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PageInfo = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.875rem;
`;

const PageButtons = styled.div`
  display: flex;
  gap: 0.35rem;
`;

const PageButton = styled.button`
  ${flexCenter}
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.theme === 'dark' ? 'rgba(74, 85, 104, 0.6)' : '#e2e8f0'};
  background-color: ${props => props.active 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.active 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '500'};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active 
      ? '#3182ce' 
      : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageEllipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-weight: bold;
`;

// Empty state components
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  animation: ${fadeIn} 0.5s ease-in-out;
  
  svg {
    color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
    margin-bottom: 1.5rem;
  }
  
  p {
    font-size: 1.125rem;
    margin-bottom: 1.5rem;
  }
`;

// Info box component
const InfoBox = styled.div`
  margin-top: 2rem;
  padding: 1.25rem;
  border-radius: 0.5rem;
  background-color: ${props => 
    props.info
      ? props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(235, 248, 255, 0.6)'
      : props.success
        ? props.theme === 'dark' ? 'rgba(72, 187, 120, 0.1)' : 'rgba(240, 255, 244, 0.6)'
        : props.warning
          ? props.theme === 'dark' ? 'rgba(237, 137, 54, 0.1)' : 'rgba(255, 250, 240, 0.6)'
          : props.error
            ? props.theme === 'dark' ? 'rgba(245, 101, 101, 0.1)' : 'rgba(254, 215, 215, 0.6)'
            : props.theme === 'dark' ? 'rgba(74, 85, 104, 0.2)' : 'rgba(226, 232, 240, 0.6)'
  };
  border-left: 4px solid ${props => 
    props.info
      ? '#4299e1'
      : props.success
        ? '#48bb78'
        : props.warning
          ? '#ed8936'
          : props.error
            ? '#f56565'
            : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'
  };
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 4px 6px rgba(0, 0, 0, 0.2)' 
      : '0 4px 10px rgba(0, 0, 0, 0.05)'};
  }
  
  svg {
    color: ${props => 
      props.info
        ? '#4299e1'
        : props.success
          ? '#48bb78'
          : props.warning
            ? '#ed8936'
            : props.error
              ? '#f56565'
              : props.theme === 'dark' ? '#a0aec0' : '#718096'
    };
  }
  
  strong {
    font-weight: 600;
  }
  
  ul {
    margin-top: 0.75rem;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
`;

// Add this styled component with your other styled components

const TableActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme === 'dark' ? 'rgba(49, 130, 206, 0.15)' : 'rgba(235, 248, 255, 0.5)'};
  border-radius: 0.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? 'rgba(49, 130, 206, 0.3)' : 'rgba(49, 130, 206, 0.15)'};
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const SelectedCount = styled.div`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#63b3ed' : '#3182ce'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    font-size: 1.125rem;
  }
`;

const ApproveButton = styled(Button)`
  background: linear-gradient(to right, #38a169, #48bb78);
  color: white;
  padding: 0.625rem 1.25rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(to right, #2f855a, #38a169);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  svg {
    font-size: 1rem;
  }
`;

const StudentClassManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  // States
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fullName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    approvedGrades: 0,
    pendingGrades: 0,
    failedGrades: 0
  });
  const [selectedExam, setSelectedExam] = useState('');
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [usersResponse, examsResponse] = await Promise.all([
          dispatch(fetchUsersList({ 
            role: 'Student', 
            pageSize: 100,
            grade: selectedGrade || undefined
          })).unwrap(),
          dispatch(fetchExams()).unwrap(),
        ]);
        
        console.log('API Response - Users:', usersResponse);
        
        // Xử lý dữ liệu học sinh từ API
        let studentData = [];
        
        // Handle different response formats
        if (Array.isArray(usersResponse)) {
          studentData = usersResponse;
        } else if (usersResponse && Array.isArray(usersResponse.items)) {
          studentData = usersResponse.items;
        } else if (usersResponse && Array.isArray(usersResponse.data)) {
          studentData = usersResponse.data;
        } else if (usersResponse && typeof usersResponse === 'object') {
          // Try to find arrays in response
          for (const key in usersResponse) {
            if (Array.isArray(usersResponse[key])) {
              studentData = usersResponse[key];
              break;
            }
          }
        }
        
        // Filter to only include students by role, completely removing any 'Admin' or 'Teacher' users
        studentData = studentData.filter(user => {
          // First, explicitly exclude users with Admin or Teacher role
          if (user.role === 'Admin' || user.role === 'Teacher') {
            return false;
          }
          
          // Explicitly exclude users with 'Admin' or 'Teacher' in the grade field
          if (user.grade === 'Admin' || user.grade === 'Teacher') {
            return false;
          }
          // Exclude users with "Lớp" in their fullName
          if (user.fullName && user.fullName.toLowerCase().includes('lớp')) {
            return false;
          }
          
          // Exclude users with "Lớp" in their username if fullName is not available
          if (!user.fullName && user.username && user.username.toLowerCase().includes('lớp')) {
            return false;
          }
          // Keep only users with Student role or those that have a valid grade (10, 11, 12)
          return user.role === 'Student' || 
                 (typeof user.grade === 'string' && ['10', '11', '12'].includes(user.grade));
        });
        
        // Process the student data
        const processedStudents = await Promise.all(studentData.map(async student => {
          // Fetch student's exam results to calculate average grade
          let averageGrade = 0;
          try {
            // Make sure student.id is a primitive value, not an object
            const studentId = typeof student.id === 'object' ? JSON.stringify(student.id) : student.id;
            
            // Fetch student's exam results with proper parameters
            const examResults = await dispatch(fetchExamResult({
              studentId: studentId,
              includeScores: true
            })).unwrap();
            
            console.log(`Exam results for student ${student.id}:`, examResults);
            
            // Handle different response formats
            let scores = [];
            if (examResults) {
              if (Array.isArray(examResults)) {
                scores = examResults;
              } else if (examResults.items && Array.isArray(examResults.items)) {
                scores = examResults.items;
              } else if (examResults.results && Array.isArray(examResults.results)) {
                scores = examResults.results;
              } else if (typeof examResults === 'object') {
                // Try to extract scores from the response
                for (const key in examResults) {
                  if (Array.isArray(examResults[key])) {
                    scores = examResults[key];
                    break;
                  }
                }
              }
            }
            
            // Find score values in the response objects
            const validScores = scores
              .map(result => {
                // Try different possible property names for the score
                const scoreValue = 
                  result.score !== undefined ? result.score :
                  result.value !== undefined ? result.value :
                  result.points !== undefined ? result.points :
                  result.result !== undefined ? result.result :
                  null;
                  
                return scoreValue;
              })
              .filter(score => score !== null && !isNaN(parseFloat(score)));
            
            if (validScores.length > 0) {
              const sum = validScores.reduce((total, score) => total + parseFloat(score), 0);
              averageGrade = (sum / validScores.length).toFixed(1);
              console.log(`Calculated average for student ${student.id}: ${averageGrade} from ${validScores.length} scores`);
            }
          } catch (error) {
            console.error(`Error fetching exam results for student ${student.id}:`, error);
          }
          
          return {
            ...student,
            studentId: student.studentId || student.id, // Use ID as studentId if not available
            grade: student.grade || (student.class?.name ? student.class.name.substring(0, 2) : ''),
            gradesStatus: student.gradesStatus || 'pending',
            // Convert the string average back to a number for proper display
            averageGrade: parseFloat(averageGrade) || 0
          };
        }));
        
        setStudents(processedStudents);
        
        // Extract unique classes from the student data
        const uniqueClasses = [...new Set(processedStudents
          .filter(s => s.class?.name)
          .map(s => s.class.name))];
        setClasses(uniqueClasses);
        
        setExams(Array.isArray(examsResponse) ? examsResponse : []);
        setFilteredStudents(processedStudents);
        
        // Calculate stats
        calculateStats(processedStudents);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        showErrorToast('Có lỗi xảy ra khi tải dữ liệu');
        
        setStudents([]);
        setFilteredStudents([]);
        setClasses([]);
        setExams([]);
        calculateStats([]);
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch, selectedGrade]);
  
  
  // Update filtered students when filters change
  useEffect(() => {
    let filtered = [...students];
    
    // Filter by grade
    if (selectedGrade) {
      filtered = filtered.filter(student => student.grade === selectedGrade);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.fullName?.toLowerCase().includes(term) ||
        student.studentId?.toLowerCase().includes(term) ||
        student.username?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term)
      );
    }
    
    // Sort data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;
        
        const valueA = typeof a[sortConfig.key] === 'string' 
          ? a[sortConfig.key].toLowerCase() 
          : a[sortConfig.key];
          
        const valueB = typeof b[sortConfig.key] === 'string' 
          ? b[sortConfig.key].toLowerCase() 
          : b[sortConfig.key];
        
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredStudents(filtered);
    calculateStats(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [students, selectedGrade, searchTerm, sortConfig]);
  
  // Calculate statistics
  const calculateStats = (studentsData) => {
    const totalStudents = studentsData.length;
    const approvedGrades = studentsData.filter(student => student.gradesStatus === 'approved').length;
    const pendingGrades = studentsData.filter(student => student.gradesStatus === 'pending').length;
    const failedGrades = studentsData.filter(student => student.gradesStatus === 'failed').length;
    
    setStats({
      totalStudents,
      approvedGrades,
      pendingGrades,
      failedGrades
    });
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled in the useEffect
  };
  
  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get the appropriate sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'asc' 
      ? <FaSortAmountUp size={12} />
      : <FaSortAmountDown size={12} />;
  };
  
  // Get current students for pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle class change
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };
  
  // Handle grade change
  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
  };
  
  // Handle student selection
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };
  
  // Handle select all students
  const handleSelectAll = () => {
    if (selectedStudents.length === currentStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(currentStudents.map(student => student.id));
    }
  };
  
  // Handle approve grades
  const handleApproveGrades = async () => {
    try {
      if (selectedStudents.length === 0) {
        showErrorToast('Vui lòng chọn ít nhất một học sinh');
        return;
      }
      
      // In a real app, call your API to approve grades
      // const response = await approveStudentGrades(selectedStudents);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessToast(`Đã duyệt điểm cho ${selectedStudents.length} học sinh`);
      
      // Update local state
      const updatedStudents = students.map(student => 
        selectedStudents.includes(student.id)
          ? { ...student, gradesStatus: 'approved' }
          : student
      );
      
      setStudents(updatedStudents);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error approving grades:', error);
      showErrorToast('Có lỗi xảy ra khi duyệt điểm');
    }
  };
  
  // Export student data to Excel
  // Sửa phần handleExportToExcel, thay đổi cách tạo tên file
const handleExportToExcel = async () => {
  try {
    if (filteredStudents.length === 0) {
      showErrorToast('Không có dữ liệu học sinh để xuất');
      return;
    }
    
    setLoading(true);
    
    // If we have a selectedClass, use the API to export that class
    if (selectedClass) {
      // Call the API endpoint
      const response = await dispatch(exportStudentsByClassroom(selectedClass)).unwrap();
      
      // API should return a blob or file URL
      if (response.fileUrl) {
        // If API returns a URL, open it
        window.open(response.fileUrl, '_blank');
      } else if (response.data) {
        // If API returns data, process it with XLSX
        const worksheet = XLSX.utils.json_to_sheet(response.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học sinh');
        
        let fileName = selectedClass 
          ? `danh_sach_hs_lop_${selectedClass}.xlsx` 
          : 'danh_sach_hoc_sinh.xlsx';
          
        XLSX.writeFile(workbook, fileName);
      }
      
      showSuccessToast('Đã xuất danh sách học sinh thành công');
    } else {
      // Client-side export if no class is selected
      // Determine which students to export
      const studentsToExport = selectedStudents.length > 0
        ? filteredStudents.filter(student => selectedStudents.includes(student.id))
        : filteredStudents;
      
      // Prepare data for export - REMOVE EMPTY COLUMNS
      const exportData = studentsToExport.map(student => ({
        'Mã học sinh': student.studentId || '',
        'Họ và tên': student.fullName || '',
        'Khối': student.grade || '',
        'Email': student.email || '',
        // Removed: 'Số điện thoại', 'Địa chỉ', 'Ngày sinh'
        'Điểm trung bình': student.averageGrade ? student.averageGrade.toFixed(1) : '0.0',
        'Trạng thái': student.gradesStatus === 'approved' ? 'Đã duyệt' : 
                      student.gradesStatus === 'pending' ? 'Chưa duyệt' : 
                      student.gradesStatus === 'failed' ? 'Không đạt' : 'N/A',
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học sinh');
      
      // Generate file name based on grade if selected
      let fileName = 'danh_sach_hoc_sinh.xlsx';
      if (selectedGrade) {
        fileName = `danh_sach_hs_khoi_${selectedGrade}.xlsx`;
      }
      
      // Export to file
      XLSX.writeFile(workbook, fileName);
      
      showSuccessToast(`Đã xuất ${exportData.length} học sinh ra file Excel`);
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    showErrorToast('Có lỗi xảy ra khi xuất file Excel');
  } finally {
    setLoading(false);
  }
};
  
  // Handle print
  const handlePrint = () => {
    window.print();
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedGrade('');
    setSearchTerm('');
    setSortConfig({ key: 'fullName', direction: 'asc' });
  };
  
  // Handle view student details
  const handleViewStudent = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };
  
  // Handle edit student
  const handleEditStudent = (studentId) => {
    navigate(`/admin/students/${studentId}/edit`);
  };

  // Add this new function to export scores by exam

const handleExportScores = async () => {
  try {
    // Check if we have an exam selected
    if (!selectedExam) {
      showErrorToast('Vui lòng chọn kỳ thi để xuất điểm');
      return;
    }
    
    setLoading(true);
    
    // Call the API endpoint
    const response = await dispatch(exportScoresByExam(selectedExam)).unwrap();
    
    // Handle the response similar to the student export
    if (response.fileUrl) {
      window.open(response.fileUrl, '_blank');
    } else if (response.data) {
      const worksheet = XLSX.utils.json_to_sheet(response.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bảng điểm');
      
      // Find the exam name
      const exam = exams.find(e => e.id === selectedExam);
      const examName = exam ? exam.name.replace(/\s+/g, '_') : 'ky_thi';
      
      XLSX.writeFile(workbook, `bang_diem_${examName}.xlsx`);
    }
    
    showSuccessToast('Đã xuất bảng điểm thành công');
  } catch (error) {
    console.error('Error exporting scores:', error);
    showErrorToast('Có lỗi xảy ra khi xuất bảng điểm');
  } finally {
    setLoading(false);
  }
};
  
  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <LoadingSpinner size={50} />
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title theme={theme}>
            <FaSchool /> Quản lý học sinh theo lớp
          </Title>
          <Subtitle theme={theme}>Xem, duyệt và xuất thông tin học sinh theo lớp</Subtitle>
        </HeaderContent>
        
        <ActionsContainer>
          <Button 
            onClick={handleExportToExcel} 
            theme={theme}
            disabled={filteredStudents.length === 0}
          >
            <FaFileExport /> Xuất DS học sinh
          </Button>
          
          <Button 
            onClick={handleExportScores} 
            theme={theme}
            disabled={!selectedExam}
          >
            <FaFileExport /> Xuất bảng điểm
          </Button>
          
          <Button 
            onClick={handlePrint} 
            theme={theme}
            disabled={filteredStudents.length === 0}
          >
            <FaPrint /> In danh sách
          </Button>
          
          <Button 
            primary 
            onClick={handleApproveGrades}
            disabled={selectedStudents.length === 0}
          >
            <FaCheckCircle /> Duyệt điểm
          </Button>
        </ActionsContainer>
      </Header>
      
      <Card 
        theme={theme}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader theme={theme}>
          <CardTitle theme={theme}>
            <FaFilter /> Lọc danh sách
          </CardTitle>
          <Button onClick={handleResetFilters} theme={theme}>
            <FaSyncAlt /> Đặt lại
          </Button>
        </CardHeader>
        <CardBody>
          <FiltersContainer>
           
            <FilterGroup>
              <Label theme={theme}>Khối</Label>
              <Select 
                value={selectedGrade}
                onChange={handleGradeChange}
                theme={theme}
              >
                <option value="">Tất cả khối</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </Select>
            </FilterGroup>
            <FilterGroup>
              <Label theme={theme}>Kỳ thi</Label>
              <Select 
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                theme={theme}
              >
                <option value="">Chọn kỳ thi...</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </FiltersContainer>
          
          <SearchContainer>
            <SearchInput 
              type="text"
              placeholder="Tìm kiếm theo tên, mã học sinh, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              theme={theme}
            />
            <SearchButton onClick={handleSearch}>
              <FaSearch />
            </SearchButton>
          </SearchContainer>
          
          <StatsRow>
            <StatCard theme={theme} type="total">
              <StatIcon type="total">
                <FaUsers />
              </StatIcon>
              <StatLabel theme={theme}>Tổng học sinh</StatLabel>
              <StatValue theme={theme} type="total">{stats.totalStudents}</StatValue>
            </StatCard>
            
            <StatCard theme={theme} type="approved">
              <StatIcon type="approved">
                <FaCheckCircle />
              </StatIcon>
              <StatLabel theme={theme}>Đã duyệt điểm</StatLabel>
              <StatValue theme={theme} type="approved">
                {stats.approvedGrades}
                {stats.totalStudents > 0 && (
                  <span>({Math.round(stats.approvedGrades / stats.totalStudents * 100)}%)</span>
                )}
              </StatValue>
            </StatCard>
            
            <StatCard theme={theme} type="pending">
              <StatIcon type="pending">
                <FaExclamationTriangle />
              </StatIcon>
              <StatLabel theme={theme}>Chưa duyệt điểm</StatLabel>
              <StatValue theme={theme} type="pending">
                {stats.pendingGrades}
                {stats.totalStudents > 0 && (
                  <span>({Math.round(stats.pendingGrades / stats.totalStudents * 100)}%)</span>
                )}
              </StatValue>
            </StatCard>
          </StatsRow>
        </CardBody>
      </Card>
      
      <Card 
        theme={theme}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <CardHeader theme={theme}>
          <CardTitle theme={theme}>
            <FaUserGraduate /> Danh sách học sinh
          </CardTitle>
          <AnimatePresence>
            {selectedStudents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ 
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: theme === 'dark' ? 'rgba(49, 130, 206, 0.2)' : 'rgba(235, 248, 255, 0.8)',
                  color: theme === 'dark' ? '#63b3ed' : '#3182ce'
                }}
              >
                Đã chọn {selectedStudents.length} học sinh
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>
        <CardBody>
          {filteredStudents.length > 0 ? (
            <>
              <AnimatePresence>
                {selectedStudents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TableActionBar theme={theme}>
                      <SelectedCount theme={theme}>
                        <FaUserGraduate /> Đã chọn {selectedStudents.length} học sinh
                      </SelectedCount>
                      <ApproveButton 
                        onClick={handleApproveGrades}
                      >
                        <FaCheckCircle /> Duyệt điểm
                      </ApproveButton>
                    </TableActionBar>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <TableContainer>
                <Table theme={theme}>
                  <thead>
                    <tr>
                      <th>
                        <CheckboxContainer>
                          <CustomCheckbox 
                            checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                            onChange={handleSelectAll}
                            theme={theme}
                          />
                        </CheckboxContainer>
                      </th>
                      <TableHeader onClick={() => handleSort('studentId')} theme={theme}>
                        Mã HS
                        <span className="sort-icon">{getSortIcon('studentId')}</span>
                      </TableHeader>
                      <TableHeader onClick={() => handleSort('fullName')} theme={theme}>
                        Họ và tên
                        <span className="sort-icon">{getSortIcon('fullName')}</span>
                      </TableHeader>
                      
                      <TableHeader onClick={() => handleSort('grade')} theme={theme}>
                        Khối
                        <span className="sort-icon">{getSortIcon('grade')}</span>
                      </TableHeader>
                      <TableHeader onClick={() => handleSort('averageGrade')} theme={theme}>
                        Điểm TB
                        <span className="sort-icon">{getSortIcon('averageGrade')}</span>
                      </TableHeader>
                      <TableHeader onClick={() => handleSort('gradesStatus')} theme={theme}>
                        Trạng thái
                        <span className="sort-icon">{getSortIcon('gradesStatus')}</span>
                      </TableHeader>
                      <TableHeader style={{ cursor: 'default' }} theme={theme}>
                        Thao tác
                      </TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student, index) => (
                      <motion.tr 
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <td>
                        <CheckboxContainer>
                          <CustomCheckbox 
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleSelectStudent(student.id)}
                            theme={theme}
                          />
                        </CheckboxContainer>
                      </td>
                      <td style={{ fontWeight: '500' }}>{student.studentId || student.id || 'N/A'}</td>
                      <td style={{ fontWeight: '500' }}>{student.fullName || student.username}</td>
                      {/* Xóa cột lớp */}
                      <td style={{ textAlign: 'center' }}>{student.grade || 'N/A'}</td>
                      <td style={{ textAlign: 'center', fontWeight: '500' }}>
                        {typeof student.averageGrade === 'number' 
                          ? student.averageGrade.toFixed(1) 
                          : typeof student.averageGrade === 'string' 
                            ? student.averageGrade 
                            : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Badge
                          status={student.gradesStatus || 'pending'}
                          theme={theme}
                        >
                          {student.gradesStatus === 'approved' ? 'Đã duyệt' :
                           student.gradesStatus === 'pending' ? 'Chưa duyệt' :
                           student.gradesStatus === 'failed' ? 'Không đạt' : 'N/A'}
                        </Badge>
                      </td>
                        <td>
                          <ActionIcons>
                            <ActionButton 
                              view
                              showText
                              theme={theme} 
                              title="Xem chi tiết học sinh"
                              onClick={() => handleViewStudent(student.id)}
                            >
                              <FaEye />
                            </ActionButton>
                            <ActionButton 
                              edit
                              showText
                              theme={theme}
                              title="Chỉnh sửa thông tin học sinh"
                              onClick={() => handleEditStudent(student.id)}
                            >
                              <FaEdit />
                            </ActionButton>
                          </ActionIcons>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
              
              <Pagination>
                <PageInfo theme={theme}>
                  Hiển thị {indexOfFirstStudent + 1}-
                  {indexOfLastStudent > filteredStudents.length 
                    ? filteredStudents.length 
                    : indexOfLastStudent} 
                  trên {filteredStudents.length} học sinh
                </PageInfo>
                
                <PageButtons>
                  <PageButton 
                    onClick={() => paginate(1)} 
                    disabled={currentPage === 1}
                    theme={theme}
                    title="Trang đầu"
                  >
                    «
                  </PageButton>
                  <PageButton 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    theme={theme}
                    title="Trang trước"
                  >
                    ‹
                  </PageButton>
                  
                  {/* Generate page numbers */}
                  {[...Array(Math.ceil(filteredStudents.length / studentsPerPage))].map((_, i) => {
                    // Show limited number of pages for better UI
                    if (
                      i === 0 || 
                      i === Math.ceil(filteredStudents.length / studentsPerPage) - 1 ||
                      (i >= currentPage - 2 && i <= currentPage + 1)
                    ) {
                      return (
                        <PageButton 
                          key={i} 
                          onClick={() => paginate(i + 1)}
                          active={currentPage === i + 1}
                          theme={theme}
                        >
                          {i + 1}
                        </PageButton>
                      );
                    } else if (
                      i === currentPage - 3 ||
                      i === currentPage + 2
                    ) {
                      return <PageEllipsis key={i} theme={theme}>...</PageEllipsis>;
                    }
                    return null;
                  })}
                  
                  <PageButton 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)}
                    theme={theme}
                    title="Trang sau"
                  >
                    ›
                  </PageButton>
                  <PageButton 
                    onClick={() => paginate(Math.ceil(filteredStudents.length / studentsPerPage))} 
                    disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)}
                    theme={theme}
                    title="Trang cuối"
                  >
                    »
                  </PageButton>
                </PageButtons>
              </Pagination>
            </>
          ) : (
            <EmptyState theme={theme}>
              <FaUserGraduate size={64} />
              <p>Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.</p>
              <Button 
                onClick={handleResetFilters}
                theme={theme}
              >
                <FaSyncAlt /> Đặt lại bộ lọc
              </Button>
            </EmptyState>
          )}
        </CardBody>
      </Card>
      
      <InfoBox info theme={theme}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaArrowDown />
          <strong>Hướng dẫn:</strong>
        </div>
        <ul>
          <li>Chọn học sinh bằng cách tích vào ô bên trái mỗi học sinh.</li>
          <li>Nhấn "Duyệt điểm" để duyệt điểm cho các học sinh đã chọn.</li>
          <li>Sử dụng chức năng "Xuất Excel" để xuất danh sách học sinh ra file Excel.</li>
          <li>Nhấn vào tên cột để sắp xếp dữ liệu theo cột đó.</li>
        </ul>
      </InfoBox>
    </Container>
  );
};

export default StudentClassManagement;