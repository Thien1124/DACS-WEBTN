import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getMaterials, uploadMaterial, uploadVideo } from '../../services/materialsService';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

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
  switch (type) {
    case 'pdf':
      return <FaFilePdf />;
    case 'doc':
    case 'docx':
      return <FaFileWord />;
    case 'xls':
    case 'xlsx':
      return <FaFileExcel />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FaImage />;
    case 'video':
      return <FaVideo />;
    case 'youtube':
      return <FaYoutube />;
    default:
      return <FaFile />;
  }
};

const TeacherMaterials = () => {
  const { theme } = useSelector(state => state.ui);
  
  // Add this state for subjects
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  
  // Other state variables remain the same
  const [activeTab, setActiveTab] = useState('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [materialType, setMaterialType] = useState('document');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialSubject, setMaterialSubject] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      
      try {
        // Prepare query parameters
        const params = {
          type: activeTab === 'documents' ? 'document' : 'video',
          search: searchTerm || undefined,
          subjectId: selectedSubject || undefined,
          page: currentPage,
          pageSize: 12
        };
        
        // Call the API
        const response = await getMaterials(params);
        
        // Update the state with the response
        setMaterials(response.items || []);
        
        // Update pagination if needed
        if (response.totalPages) {
          // You might need to add pagination state if not already present
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
        // Fallback to mock data if API fails
        const mockData = [
          {
            id: 1,
            type: 'pdf',
            title: 'Tài liệu ôn tập Toán học - Đại số và Giải tích',
            subject: 'math',
            description: 'Tài liệu tổng hợp các công thức và bài tập ôn tập trước kỳ thi',
            date: '2025-04-25',
            size: 2500000,
            url: '#',
            thumbnail: null,
            tags: ['đại số', 'giải tích', 'luyện thi']
          },
          {
            id: 2,
            type: 'youtube',
            title: 'Hướng dẫn giải các dạng bài tập Vật lý THPT Quốc gia',
            subject: 'physics',
            description: 'Video hướng dẫn chi tiết cách giải các dạng bài tập thường gặp',
            date: '2025-04-23',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
            tags: ['vật lý', 'bài tập', 'luyện thi']
          },
          {
            id: 3,
            type: 'docx',
            title: 'Tài liệu tổng hợp câu hỏi trắc nghiệm Hóa học',
            subject: 'chemistry',
            description: 'Bộ câu hỏi trắc nghiệm theo từng chuyên đề hóa học',
            date: '2025-04-21',
            size: 1850000,
            url: '#',
            thumbnail: null,
            tags: ['hóa học', 'trắc nghiệm', 'chuyên đề']
          },
          {
            id: 4,
            type: 'youtube',
            title: 'Phương pháp làm bài thi Tiếng Anh hiệu quả',
            subject: 'english',
            description: 'Giải mã các chiến thuật làm bài thi tiếng Anh đạt điểm cao',
            date: '2025-04-20',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
            tags: ['tiếng anh', 'kỹ năng', 'phương pháp']
          },
          {
            id: 5,
            type: 'pdf',
            title: 'Đề cương ôn tập Văn học',
            subject: 'literature',
            description: 'Tổng hợp kiến thức trọng tâm và đề cương các tác phẩm văn học',
            date: '2025-04-18',
            size: 3200000,
            url: '#',
            thumbnail: null,
            tags: ['văn học', 'đề cương', 'ôn tập']
          },
          {
            id: 6,
            type: 'xlsx',
            title: 'Bảng tổng hợp công thức Hóa học THPT',
            subject: 'chemistry',
            description: 'File Excel tổng hợp công thức hóa học cần nhớ',
            date: '2025-04-15',
            size: 980000,
            url: '#',
            thumbnail: null,
            tags: ['hóa học', 'công thức', 'tổng hợp']
          }
        ];
        // Filter logic remains the same
        setMaterials(mockData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [activeTab, searchTerm, selectedSubject, currentPage]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Create form data for upload
      const formData = new FormData();
      
      // Add common fields
      formData.append('title', materialTitle);
      formData.append('description', materialDescription);
      formData.append('subjectId', materialSubject);
      formData.append('tags', JSON.stringify(tags));
      
      let response;
      
      if (materialType === 'document') {
        // Upload documents
        if (selectedFiles.length === 0) {
          showErrorToast('Vui lòng chọn ít nhất một tệp tài liệu');
          setIsSubmitting(false);
          return;
        }
        
        // Append each file to the form data
        selectedFiles.forEach(fileData => {
          formData.append('files', fileData.file);
        });
        
        response = await uploadMaterial(formData);
      } else {
        // Upload video (YouTube URL)
        if (!youtubeUrl) {
          showErrorToast('Vui lòng nhập URL YouTube');
          setIsSubmitting(false);
          return;
        }
        
        formData.append('youtubeUrl', youtubeUrl);
        response = await uploadVideo(formData);
      }
      
      showSuccessToast(`${materialType === 'document' ? 'Tài liệu' : 'Video'} đã được tải lên thành công`);
      
      // Add the new material to the list
      setMaterials(prev => [
        {
          id: response.id,
          type: materialType === 'document' ? selectedFiles[0]?.type || 'pdf' : 'youtube',
          title: materialTitle,
          subject: materialSubject,
          description: materialDescription,
          date: new Date().toISOString().split('T')[0],
          size: selectedFiles[0]?.size || 0,
          url: response.url || '#',
          thumbnail: materialType === 'youtube' ? response.thumbnail : null,
          tags: tags
        },
        ...prev
      ]);
      
      // Reset form
      setMaterialType('document');
      setSelectedFiles([]);
      setYoutubeUrl('');
      setMaterialTitle('');
      setMaterialDescription('');
      setMaterialSubject('');
      setTags([]);
      
      // Close modal
      setShowAddModal(false);
    } catch (error) {
      console.error('Error uploading material:', error);
      showErrorToast(`Không thể tải lên ${materialType === 'document' ? 'tài liệu' : 'video'}. Vui lòng thử lại.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container>
        <PageTitle theme={theme}>
          <FaBook />
          Tài liệu ôn tập
        </PageTitle>
        
        {/* Tabs */}
        <TabContainer theme={theme}>
          <Tab 
            theme={theme}
            active={activeTab === 'documents'} 
            onClick={() => setActiveTab('documents')}
          >
            <FaFile />
            Tài liệu
          </Tab>
          <Tab 
            theme={theme}
            active={activeTab === 'videos'} 
            onClick={() => setActiveTab('videos')}
          >
            <FaVideo />
            Video
          </Tab>
        </TabContainer>
        
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
              {activeTab === 'documents' ? <FaFile /> : <FaVideo />}
            </EmptyIcon>
            <EmptyTitle theme={theme}>Không có {activeTab === 'documents' ? 'tài liệu' : 'video'} nào</EmptyTitle>
            <EmptyDescription theme={theme}>
              {activeTab === 'documents' 
                ? 'Hãy thêm tài liệu để hỗ trợ học sinh ôn tập trước kỳ thi.'
                : 'Hãy thêm video để hỗ trợ học sinh ôn tập trước kỳ thi.'
              }
            </EmptyDescription>
            <AddButton onClick={() => setShowAddModal(true)}>
              <FaPlus />
              Thêm {activeTab === 'documents' ? 'tài liệu' : 'video'} mới
            </AddButton>
          </EmptyState>
        ) : (
          <MaterialsGrid>
            {materials.map(material => (
              <MaterialCard key={material.id} theme={theme}>
                <CardPreview theme={theme}>
                  {material.type === 'youtube' ? (
                    <img src={material.thumbnail} alt={material.title} />
                  ) : (
                    getFileIcon(material.type)
                  )}
                </CardPreview>
                <CardContent>
                  <CardTitle theme={theme}>{material.title}</CardTitle>
                  <CardMeta>
                    <CardMetaItem theme={theme}>
                      <FaLayerGroup />
                      {subjects.find(s => s.id === material.subject)?.name}
                    </CardMetaItem>
                    <CardMetaItem theme={theme}>
                      {material.type !== 'youtube' ? (
                        formatBytes(material.size)
                      ) : (
                        <FaYoutube />
                      )}
                    </CardMetaItem>
                  </CardMeta>
                  <CardTags>
                    {material.tags.map((tag, index) => (
                      <Tag key={index} theme={theme}>
                        <FaTag />
                        {tag}
                      </Tag>
                    ))}
                  </CardTags>
                  <CardActions>
                    <ActionButton theme={theme} action="view">
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
        
        {/* Add Material Modal */}
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
                      {materialType === 'document' ? <FaFileUpload /> : <FaVideo />}
                      {materialType === 'document' ? 'Thêm tài liệu mới' : 'Thêm video mới'}
                    </ModalTitle>
                    <CloseButton theme={theme} onClick={() => setShowAddModal(false)}>
                      <FaTimes />
                    </CloseButton>
                  </ModalHeader>
                  
                  <ModalBody>
                    <FormGroup>
                      <FormLabel theme={theme}>Loại tài liệu</FormLabel>
                      <RadioGroup>
                        <RadioOption theme={theme}>
                          <input 
                            type="radio" 
                            name="materialType" 
                            value="document" 
                            checked={materialType === 'document'} 
                            onChange={() => setMaterialType('document')}
                          />
                          <FaFile />
                          Tài liệu
                        </RadioOption>
                        <RadioOption theme={theme}>
                          <input 
                            type="radio" 
                            name="materialType" 
                            value="video" 
                            checked={materialType === 'video'} 
                            onChange={() => setMaterialType('video')}
                          />
                          <FaVideo />
                          Video
                        </RadioOption>
                      </RadioGroup>
                    </FormGroup>
                    
                    {materialType === 'document' ? (
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
                          />
                          <UploadIcon theme={theme}>
                            <FaFileUpload />
                          </UploadIcon>
                          <UploadText theme={theme}>Kéo thả tài liệu vào đây hoặc bấm để chọn</UploadText>
                          <UploadSubtext theme={theme}>
                            Hỗ trợ PDF, Word, Excel, PowerPoint, và các định dạng hình ảnh
                          </UploadSubtext>
                        </UploadArea>
                        
                        {selectedFiles.length > 0 && (
                          <UploadPreview>
                            {selectedFiles.map(file => (
                              <FilePreview key={file.id} theme={theme}>
                                <FileIcon>
                                  {getFileIcon(file.type)}
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
                    ) : (
                      <FormGroup>
                        <FormLabel theme={theme}>URL YouTube</FormLabel>
                        <FormInput 
                          theme={theme} 
                          type="text" 
                          placeholder="Ví dụ: https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          required
                        />
                      </FormGroup>
                    )}
                    
                    <FormGroup>
                      <FormLabel theme={theme}>Tiêu đề</FormLabel>
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
                      <FormLabel theme={theme}>Môn học</FormLabel>
                      <FormSelect 
                        theme={theme} 
                        value={materialSubject}
                        onChange={(e) => setMaterialSubject(e.target.value)}
                        required
                        disabled={loadingSubjects}
                      >
                        <option value="">
                          {loadingSubjects ? 'Đang tải môn học...' : 'Chọn môn học'}
                        </option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
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
                      disabled={isSubmitting || (materialType === 'document' && selectedFiles.length === 0) || !materialTitle || !materialSubject}
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