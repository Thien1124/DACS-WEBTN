import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaFileUpload, 
  FaVideo, 
  FaFile, 
  FaFilePdf, 
  FaFileWord, 
  FaFileExcel,
  FaImage,
  FaYoutube,
  FaLink,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaCheck,
  FaTimes,
  FaSort,
  FaFilter,
  FaBook,
  FaLayerGroup,
  FaTag
} from 'react-icons/fa';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMaterials, uploadMaterial } from '../../services/materialsService';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import documentDefaultImg from '../../assets/images/document-default.png';
import pdfDefaultImg from '../../assets/images/pdf-default.png';
import wordDefaultImg from '../../assets/images/word-default.png';
import excelDefaultImg from '../../assets/images/excel-default.png';
import powerPointDefaultImg from '../../assets/images/powerpoint-default.png';


// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
  width: 100%;
`;

const PageTitle = styled.h1`
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 2rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.75rem;
    color: #4299e1;
  }
`;

// Update TabContainer and Tab components
const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  margin-bottom: 2rem;
  gap: 8px;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active 
    ? (props.theme === 'dark' ? '#2a4365' : '#ebf8ff') 
    : 'none'
  };
  border: none;
  border-radius: 8px 8px 0 0;
  border-bottom: 3px solid ${props => 
    props.active 
      ? '#4299e1' 
      : 'transparent'
  };
  color: ${props => 
    props.active 
      ? (props.theme === 'dark' ? '#e2e8f0' : '#2b6cb0')
      : (props.theme === 'dark' ? '#a0aec0' : '#718096')
  };
  font-weight: ${props => props.active ? '600' : '500'};
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    font-size: ${props => props.active ? '1.1rem' : '1rem'};
  }
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2b6cb0'};
    background-color: ${props => !props.active && (props.theme === 'dark' ? 'rgba(42, 67, 101, 0.3)' : 'rgba(235, 248, 255, 0.5)')};
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 5px;
  padding: 0.5rem 1rem;
  width: 300px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  svg {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
    margin-right: 0.5rem;
  }
  
  input {
    flex: 1;
    border: none;
    background: transparent;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    outline: none;
    
    &::placeholder {
      color: ${props => props.theme === 'dark' ? '#a0aec0' : '#a0aec0'};
    }
  }
`;

// Update these styled components for a proper dropdown

const FilterDropdown = styled.div`
  position: relative;
  user-select: none;
`;

const DropdownButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  min-width: 180px;
  box-shadow: ${props => props.active ? '0 0 0 2px #4299e1' : 'none'};
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#3a4a61' : '#f7fafc'};
    border-color: #4299e1;
  }
`;

const DropdownLabel = styled.span`
  margin-right: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const DropdownValue = styled.span`
  font-weight: 600;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const DropdownArrow = styled.span`
  margin-left: 0.5rem;
  transition: transform 0.2s;
  transform: ${props => props.open ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  z-index: 10;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
  
  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  
  ${props => props.selected && `
    background-color: ${props.theme === 'dark' ? '#2c5282' : '#ebf8ff'};
    color: ${props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
    font-weight: 600;
  `}
`;

// Update AddButton component
const AddButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.7rem 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.3);
  
  svg {
    margin-right: 0.5rem;
    font-size: 1.1rem;
  }
  
  &:hover {
    background-color: #3182ce;
    box-shadow: 0 4px 6px rgba(66, 153, 225, 0.4);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(66, 153, 225, 0.3);
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
    transform: none;
  }
`;

const MaterialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MaterialCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const CardPreview = styled.div`
  height: 160px;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#edf2f7'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  
  svg {
    font-size: 3rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const CardTitle = styled.h3`
  margin: 0 0 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1.1rem;
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const CardMetaItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  svg {
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }
`;

const CardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const Tag = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.25rem;
    font-size: 0.7rem;
  }
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#1a202c'};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 10;
  
  &:before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#1a202c'};
  }
`;
// Update ActionButton styled component
const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.8rem;
  min-width: 90px;
  height: 36px;
  border-radius: 8px;
  border: none;
  position: relative;
  background-color: ${props => {
    if (props.action === 'view') return props.theme === 'dark' ? '#2c5282' : '#ebf8ff';
    if (props.action === 'edit') return props.theme === 'dark' ? '#2c7a7b' : '#e6fffa';
    if (props.action === 'delete') return props.theme === 'dark' ? '#9b2c2c' : '#fff5f5';
    return props.theme === 'dark' ? '#2d3748' : '#edf2f7';
  }};
  color: ${props => {
    if (props.action === 'view') return props.theme === 'dark' ? '#90cdf4' : '#3182ce';
    if (props.action === 'edit') return props.theme === 'dark' ? '#81e6d9' : '#319795';
    if (props.action === 'delete') return props.theme === 'dark' ? '#feb2b2' : '#e53e3e';
    return props.theme === 'dark' ? '#a0aec0' : '#718096';
  }};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
  gap: 6px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 1rem;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 5px;
  margin: 0 0.25rem;
  border: 1px solid ${props => props.active ? '#4299e1' : (props.theme === 'dark' ? '#4a5568' : '#e2e8f0')};
  background-color: ${props => props.active 
    ? (props.theme === 'dark' ? '#4299e1' : '#4299e1') 
    : (props.theme === 'dark' ? '#2d3748' : '#ffffff')
  };
  color: ${props => props.active 
    ? '#ffffff' 
    : (props.theme === 'dark' ? '#e2e8f0' : '#2d3748')
  };
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active 
      ? '#3182ce' 
      : (props.theme === 'dark' ? '#4a5568' : '#edf2f7')
    };
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

// Modal styled components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  width: 100%;
  max-width: 700px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.75rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  input {
    margin-right: 0.5rem;
  }
  
  svg {
    margin-right: 0.5rem;
    color: #4299e1;
  }
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  padding: 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  min-height: 50px;
`;

const TagItem = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-size: 0.85rem;
  
  button {
    background: none;
    border: none;
    display: flex;
    align-items: center;
    color: inherit;
    cursor: pointer;
    margin-left: 0.25rem;
  }
`;

const TagInputField = styled.input`
  flex: 1;
  min-width: 100px;
  border: none;
  background: transparent;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  outline: none;
  padding: 0.25rem;
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  padding: 2rem;
  text-align: center;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #4299e1;
  }
  
  input {
    display: none;
  }
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#a0aec0'};
  margin-bottom: 1rem;
`;

const UploadText = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const UploadSubtext = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.85rem;
`;

const UploadPreview = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  border-radius: 5px;
`;

const FileIcon = styled.div`
  margin-right: 1rem;
  font-size: 1.5rem;
  color: #4299e1;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.85rem;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#fc8181' : '#e53e3e'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-top: 1px solid ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  gap: 1rem;
`;

// Update CancelButton and SaveButton components
const CancelButton = styled.button`
  padding: 0.7rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SaveButton = styled.button`
  padding: 0.7rem 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.3);
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: #3182ce;
    box-shadow: 0 4px 6px rgba(66, 153, 225, 0.4);
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  margin-bottom: 1.5rem;
`;

const EmptyTitle = styled.h3`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
`;

const EmptyDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  max-width: 400px;
  margin-bottom: 1.5rem;
`;

// Format file size
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// File type icons
const getFileIcon = (type) => {
  if (!type || typeof type !== 'string') {
    return <img 
      src={documentDefaultImg} 
      alt="Document" 
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
    />;
  }
  
  switch (type.toLowerCase()) {
    case 'pdf':
      return <img 
        src={pdfDefaultImg} 
        alt="PDF" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />;
    case 'doc':
    case 'docx':
      return <img 
        src={wordDefaultImg} 
        alt="Word" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />;
    case 'xls':
    case 'xlsx':
      return <img 
        src={excelDefaultImg} 
        alt="Excel" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />;
    case 'ppt':
    case 'pptx':
      return <img 
        src={powerPointDefaultImg} 
        alt="PowerPoint" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f5fa'
      }}>
        <FaImage style={{ fontSize: '3rem', color: '#3182ce' }} />
      </div>;
    default:
      return <img 
        src={documentDefaultImg} 
        alt="Document" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />;
  }
};

const TeacherMaterials = () => {
  const { theme } = useSelector(state => state.ui);
  
  // State variables
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialSubject, setMaterialSubject] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState('0');
  const [grades, setGrades] = useState([
    { id: 10, name: 'Khối 10' },
    { id: 11, name: 'Khối 11' },
    { id: 12, name: 'Khối 12' }
  ]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  
  const fileInputRef = useRef(null);

  // Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const response = await axios.get(`${API_URL}/api/Subject/all`);
        // Assuming the API returns an array of subjects with id and name properties
        // Adjust the mapping according to your actual API response structure
        const formattedSubjects = response.data.map(subject => ({
          id: subject.id.toString(),
          name: subject.name
        }));
        setSubjects(formattedSubjects);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        // Fallback to default subjects if API call fails
        setSubjects([
          { id: 'math', name: 'Toán học' },
          { id: 'physics', name: 'Vật lý' },
          { id: 'chemistry', name: 'Hóa học' },
          { id: 'biology', name: 'Sinh học' },
          { id: 'literature', name: 'Ngữ văn' },
          { id: 'history', name: 'Lịch sử' },
          { id: 'geography', name: 'Địa lý' },
          { id: 'english', name: 'Tiếng Anh' }
        ]);
      } finally {
        setLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, []);
  const getFileTypeFromName = (filename) => {
  if (!filename) return '';
  
  if (filename.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx')) return 'doc';
  if (filename.toLowerCase().endsWith('.xls') || filename.toLowerCase().endsWith('.xlsx')) return 'xls';
  if (filename.toLowerCase().endsWith('.ppt') || filename.toLowerCase().endsWith('.pptx')) return 'ppt';
  if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) return 'jpg';
  if (filename.toLowerCase().endsWith('.png')) return 'png';
  if (filename.toLowerCase().endsWith('.gif')) return 'gif';
  
  return '';
};
  // Add this useEffect hook to fetch chapters when subject changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (!materialSubject) {
        setChapters([]);
        return;
      }
      
      setLoadingChapters(true);
      try {
        // Use API endpoint to fetch chapters by subject
        const response = await axios.get(`${API_URL}/api/Chapter`, {
          params: {
            subjectId: materialSubject,
            page: 1,
            pageSize: 50,
            includeInactive: false
          }
        });
        
        console.log('Chapters response:', response.data);
        
        if (response.data && response.data.data) {
          setChapters(response.data.data);
        } else {
          setChapters([]);
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
        setChapters([]);
      } finally {
        setLoadingChapters(false);
      }
    };
    
    fetchChapters();
  }, [materialSubject]);

  // Thêm useEffect để lọc môn học dựa trên khối được chọn
  useEffect(() => {
    if (!selectedGrade || !subjects.length) {
      setFilteredSubjects(subjects);
      return;
    }
    
    // Lọc môn học dựa trên khối được chọn
    // Giả sử tên môn học có dạng "Toán 10", "Vật Lý 10", v.v.
    const filtered = subjects.filter(subject => {
      const subjectName = subject.name.toLowerCase();
      // Kiểm tra nếu tên môn học chứa số khối
      return subjectName.includes(` ${selectedGrade}`) || 
             subjectName.endsWith(` ${selectedGrade}`);
    });
    
    setFilteredSubjects(filtered);
  }, [selectedGrade, subjects]);
  
    // Handle file upload
    const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [
      ...prev,
      ...files.map(file => ({
        file,
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop().toLowerCase()
      }))
    ]);
  };
  
  // Handle remove file
  const handleRemoveFile = (id) => {
  setSelectedFiles(prev => prev.filter(file => file.id !== id));
};
  // Handle tag input
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags(prev => [...prev, tagInput.trim()]);
      }
      setTagInput('');
    }
  };
  
  // Handle remove tag
  const handleRemoveTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
  };
  
  // Handle subject filter
  const handleSubjectFilter = (subjectId) => {
    // If the same subject is clicked again, clear the selection
    if (selectedSubject === subjectId) {
      setSelectedSubject('');
    } else {
      // Otherwise, set the new selection
      setSelectedSubject(subjectId);
    }
  };
  
  // Mock data for materials
  const fetchMaterials = async () => {
    setLoading(true);
    
    try {
      // Prepare query parameters - use actual API params
      const params = {
        subjectId: selectedSubject || undefined,
        chapterId: undefined, // Add this if you want to filter by chapter
        documentType: undefined, // Add this if you want to filter by document type
        search: searchTerm || undefined,
        page: currentPage,
        pageSize: 12
      };
      
      // Call the API
      const response = await getMaterials(params);
      
      // Log để debug thông tin
      console.log('Fetched materials:', response.items);
      
      // Update the state with the response data
      setMaterials(response.items || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      showErrorToast('Không thể tải danh sách tài liệu');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [searchTerm, selectedSubject, currentPage]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (selectedFiles.length === 0) {
        showErrorToast('Vui lòng chọn ít nhất một tệp tài liệu');
        setIsSubmitting(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('file', selectedFiles[0].file);
      formData.append('title', materialTitle);
      
      if (materialDescription) {
        formData.append('description', materialDescription);
      }
      
      if (materialSubject) {
        formData.append('subjectId', parseInt(materialSubject));
      }
      
      formData.append('chapterId', parseInt(selectedChapter || 0));
      
      const fileExt = selectedFiles[0].name.split('.').pop().toLowerCase();
      formData.append('documentType', fileExt);
      
      if (tags.length > 0) {
        formData.append('tags', tags.join(','));
      }
      
      const response = await uploadMaterial(formData);
      
      if (response) {
        showSuccessToast('Tài liệu đã được tải lên thành công');
        // Reset form
        setSelectedFiles([]);
        setMaterialTitle('');
        setMaterialDescription('');
        setMaterialSubject('');
        setTags([]);
        setShowAddModal(false);
        setSelectedChapter('0');
        setSelectedGrade('');
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      
      if (error.response?.status === 413) {
        showErrorToast('File quá lớn. Vui lòng chọn file nhỏ hơn.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.Message || 
                            'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        showErrorToast(errorMessage);
      } else if (error.response?.status === 401) {
        showErrorToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        showErrorToast('Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ admin.');
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Không thể tải lên tài liệu. Vui lòng thử lại.';
        showErrorToast(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Cách tốt hơn là thêm state để xử lý lỗi ảnh
  const [imageErrors, setImageErrors] = useState({});

  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container>
        <PageTitle theme={theme}>
          <FaBook />
          Tài liệu ôn tập
        </PageTitle>
        
        {/* Action Bar */}
        <ActionBar>
          <SearchBar theme={theme}>
            <FaSearch />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <FilterDropdown>
              <DropdownButton theme={theme} onClick={() => setShowFilterOptions(!showFilterOptions)}>
                <DropdownLabel theme={theme}>Môn học</DropdownLabel>
                <DropdownValue theme={theme}>
                  {selectedSubject 
                    ? subjects.find(subject => subject.id === selectedSubject)?.name 
                    : 'Chọn môn học'
                  }
                </DropdownValue>
                <DropdownArrow theme={theme} open={showFilterOptions}>
                  <FaSort />
                </DropdownArrow>
              </DropdownButton>
              
              <AnimatePresence>
                {showFilterOptions && (
                  <DropdownMenu
                    theme={theme}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {loadingSubjects ? (
                      <DropdownItem theme={theme}>
                        <LoadingSpinner size={16} />
                        Đang tải môn học...
                      </DropdownItem>
                    ) : subjects.length === 0 ? (
                      <DropdownItem theme={theme}>
                        Không có môn học nào
                      </DropdownItem>
                    ) : (
                      subjects.map(subject => (
                        <DropdownItem 
                          key={subject.id} 
                          theme={theme}
                          selected={selectedSubject === subject.id}
                          onClick={() => handleSubjectFilter(subject.id)}
                        >
                          {selectedSubject === subject.id ? <FaCheck /> : <FaLayerGroup />}
                          {subject.name}
                        </DropdownItem>
                      ))
                    )}
                  </DropdownMenu>
                )}
              </AnimatePresence>
            </FilterDropdown>
            
            <AddButton onClick={() => setShowAddModal(true)}>
              <FaPlus />
              Thêm mới
            </AddButton>
          </div>
        </ActionBar>
        
        {/* Materials Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <LoadingSpinner size={40} />
          </div>
        ) : materials.length === 0 ? (
          <EmptyState theme={theme}>
            <EmptyIcon theme={theme}>
              <FaFile />
            </EmptyIcon>
            <EmptyTitle theme={theme}>Không có tài liệu nào</EmptyTitle>
            <EmptyDescription theme={theme}>
              Hãy thêm tài liệu để hỗ trợ học sinh ôn tập trước kỳ thi.
            </EmptyDescription>
            <AddButton onClick={() => setShowAddModal(true)}>
              <FaPlus />
              Thêm tài liệu mới
            </AddButton>
          </EmptyState>
        ) : (
          <MaterialsGrid>
            {materials.map(material => (
              <MaterialCard key={material.id} theme={theme}>
                <CardPreview theme={theme}>
                  {material.thumbnailUrl && !imageErrors[material.id] ? (
                    <img 
                      src={`${API_URL}${material.thumbnailUrl}`} 
                      alt={material.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => {
                        // Khi ảnh lỗi, đánh dấu ID này vào state lỗi
                        setImageErrors(prev => ({
                          ...prev,
                          [material.id]: true
                        }));
                      }}
                    />
                  ) : (
                    getFileIcon(material.fileType || material.documentType || getFileTypeFromName(material.title))
                  )}
                </CardPreview>
                <CardContent>
                  <CardTitle theme={theme}>{material.title}</CardTitle>
                  <CardMeta>
                    <CardMetaItem theme={theme}>
                      <FaLayerGroup />
                      {material.subjectName}
                    </CardMetaItem>
                    <CardMetaItem theme={theme}>
                      {formatBytes(material.fileSize)}
                    </CardMetaItem>
                  </CardMeta>
                  
                  {material.chapterName && (
                    <CardMetaItem theme={theme} style={{marginBottom: '0.5rem'}}>
                      <FaBook />
                      {material.chapterName}
                    </CardMetaItem>
                  )}
                  
                  <CardTags>
                    {material.tags && material.tags.split(',').map((tag, index) => (
                      <Tag key={index} theme={theme}>
                        <FaTag />
                        {tag.trim()}
                      </Tag>
                    ))}
                  </CardTags>
                  <CardActions>
                    <ActionButton 
                      theme={theme} 
                      action="view"
                      as={Link}
                      to={`/teacher/materials/${material.id}`}
                    >
                      <FaEye />
                      Xem
                    </ActionButton>
                    <ActionButton theme={theme} action="edit">
                      <FaEdit />
                      Sửa
                    </ActionButton>
                    <ActionButton theme={theme} action="delete">
                      <FaTrash />
                      Xóa
                    </ActionButton>
                  </CardActions>
                </CardContent>
              </MaterialCard>
            ))}
          </MaterialsGrid>
        )}
        
        {/* Pagination */}
        {materials.length > 0 && (
          <Pagination>
            <PageButton 
              theme={theme} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              &lt;
            </PageButton>
            {[...Array(3)].map((_, i) => (
              <PageButton 
                key={i} 
                theme={theme} 
                active={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </PageButton>
            ))}
            <PageButton 
              theme={theme} 
              disabled={currentPage === 3}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, 3))}
            >
              &gt;
            </PageButton>
          </Pagination>
        )}
        
        {/* Add Material Modal - cập nhật để chỉ hiển thị form tài liệu */}
        <AnimatePresence>
          {showAddModal && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ModalContent
                theme={theme}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSubmit}>
                  <ModalHeader theme={theme}>
                    <ModalTitle theme={theme}>
                      <FaFileUpload />
                      Thêm tài liệu mới
                    </ModalTitle>
                    <CloseButton theme={theme} onClick={() => setShowAddModal(false)}>
                      <FaTimes />
                    </CloseButton>
                  </ModalHeader>
                  
                  <ModalBody>
                    <FormGroup>
                      <FormLabel theme={theme}>Tải lên tài liệu</FormLabel>
                      <UploadArea 
                        theme={theme} 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input 
                          type="file" 
                          multiple 
                          ref={fileInputRef} 
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                        />
                        <UploadIcon theme={theme}>
                          <FaFileUpload />
                        </UploadIcon>
                        <UploadText theme={theme}>
                          {selectedFiles.length > 0 
                            ? `Đã chọn ${selectedFiles.length} tệp`
                            : 'Kéo thả tài liệu vào đây hoặc bấm để chọn'
                          }
                        </UploadText>
                        <UploadSubtext theme={theme}>
                          Hỗ trợ PDF, Word, Excel, PowerPoint, và các định dạng hình ảnh
                        </UploadSubtext>
                      </UploadArea>
                      
                      {selectedFiles.length > 0 && (
                        <UploadPreview>
                          {selectedFiles.map(file => (
                            <FilePreview key={file.id} theme={theme}>
                              <FileIcon>
                                {getFileIcon(file.type || getFileTypeFromName(file.name))}
                              </FileIcon>
                              <FileInfo>
                                <FileName theme={theme}>{file.name}</FileName>
                                <FileSize theme={theme}>{formatBytes(file.size)}</FileSize>
                              </FileInfo>
                              <RemoveFileButton 
                                theme={theme} 
                                onClick={() => handleRemoveFile(file.id)}
                              >
                                <FaTimes />
                              </RemoveFileButton>
                            </FilePreview>
                          ))}
                        </UploadPreview>
                      )}
                    </FormGroup>
                    
                    <FormGroup>
                      <FormLabel theme={theme}>Tiêu đề *</FormLabel>
                      <FormInput 
                        theme={theme} 
                        type="text" 
                        placeholder="Nhập tiêu đề tài liệu" 
                        value={materialTitle}
                        onChange={(e) => setMaterialTitle(e.target.value)}
                        required
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <FormLabel theme={theme}>Mô tả</FormLabel>
                      <FormTextarea 
                        theme={theme} 
                        placeholder="Mô tả ngắn về tài liệu" 
                        value={materialDescription}
                        onChange={(e) => setMaterialDescription(e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel theme={theme}>Khối</FormLabel>
                      <FormSelect 
                        theme={theme} 
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                      >
                        <option value="">Tất cả khối</option>
                        {grades.map(grade => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name}
                          </option>
                        ))}
                      </FormSelect>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel theme={theme}>Môn học *</FormLabel>
                      <FormSelect 
                        theme={theme} 
                        value={materialSubject}
                        onChange={(e) => setMaterialSubject(e.target.value)}
                        required
                        disabled={loadingSubjects}
                      >
                        <option value="">
                          {loadingSubjects ? 'Đang tải môn học...' : 
                          selectedGrade ? `Chọn môn học khối ${selectedGrade}` : 'Chọn môn học'}
                        </option>
                        {filteredSubjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </FormSelect>
                      
                      {selectedGrade && filteredSubjects.length === 0 && !loadingSubjects && (
                        <div style={{ 
                          color: '#e53e3e', 
                          marginTop: '0.5rem', 
                          fontSize: '0.875rem' 
                        }}>
                          Không tìm thấy môn học cho khối {selectedGrade}
                        </div>
                      )}
                    </FormGroup>
                    
                    <FormGroup>
                      <FormLabel theme={theme}>Chương/Chuyên đề</FormLabel>
                      <FormSelect 
                        theme={theme} 
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(e.target.value)}
                        disabled={loadingChapters || !materialSubject}
                      >
                        <option value="0">Không thuộc chương cụ thể</option>
                        {loadingChapters ? (
                          <option value="" disabled>Đang tải chương...</option>
                        ) : (
                          chapters.map(chapter => (
                            <option key={chapter.id} value={chapter.id}>
                              {chapter.name}
                            </option>
                          ))
                        )}
                      </FormSelect>
                    </FormGroup>

                    <FormGroup>
                      <FormLabel theme={theme}>Thẻ gắn</FormLabel>
                      <TagInput theme={theme}>
                        {tags.map((tag, index) => (
                          <TagItem key={index} theme={theme}>
                            {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag)}>
                              <FaTimes />
                            </button>
                          </TagItem>
                        ))}
                        <TagInputField 
                          theme={theme} 
                          placeholder="Thêm thẻ và nhấn Enter" 
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagInputKeyDown}
                        />
                      </TagInput>
                    </FormGroup>
                  </ModalBody>
                  
                  <ModalFooter theme={theme}>
                    <CancelButton 
                      theme={theme} 
                      type="button" 
                      onClick={() => setShowAddModal(false)}
                      disabled={isSubmitting}
                    >
                      Hủy
                    </CancelButton>
                    <SaveButton 
                      type="submit"
                      disabled={
                        isSubmitting || 
                        selectedFiles.length === 0 || 
                        !materialTitle || 
                        !materialSubject
                      }
                    >
                      {isSubmitting ? <LoadingSpinner size={16} color="#ffffff" /> : <FaCheck />}
                      {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </SaveButton>
                  </ModalFooter>
                </form>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </Container>
      <Footer />
    </PageWrapper>
  );
};

export default TeacherMaterials;
