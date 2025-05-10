import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaDownload, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaLayerGroup, 
  FaBook, 
  FaTag, 
  FaCalendarAlt, 
  FaDownload as FaDownloadCount,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaImage,
  FaFile
} from 'react-icons/fa';
import { API_URL } from '../../config/constants';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMaterialById } from '../../services/materialsService';
import { showErrorToast } from '../../utils/toastUtils';

// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1.5rem;
  width: 100%;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1rem;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const DetailCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const DetailHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const DetailTitle = styled.h1`
  margin: 0 0 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1.8rem;
`;

const DetailDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
`;

const DetailContent = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const PreviewSection = styled.div`
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-right: ${props => props.theme === 'dark' ? '1px solid #4a5568' : '1px solid #e2e8f0'};
  
  @media (max-width: 767px) {
    border-right: none;
    border-bottom: ${props => props.theme === 'dark' ? '1px solid #4a5568' : '1px solid #e2e8f0'};
  }
`;

const PreviewIcon = styled.div`
  font-size: 5rem;
  color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  margin-bottom: 1rem;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const PreviewText = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-top: 0.5rem;
  text-align: center;
`;

const MetadataSection = styled.div`
  flex: 1;
  padding: 1.5rem;
`;

const MetadataGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MetadataTitle = styled.h3`
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-weight: 500;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  padding-bottom: 0.5rem;
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  svg {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
    margin-right: 0.75rem;
    font-size: 1rem;
  }
`;

const MetadataLabel = styled.span`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.9rem;
  margin-right: 0.5rem;
`;

const MetadataValue = styled.span`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  font-size: 0.9rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
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

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const DownloadButton = styled(ActionButton)`
  background-color: #4299e1;
  color: white;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const ViewButton = styled(ActionButton)`
  background-color: ${props => props.theme === 'dark' ? '#2c5282' : '#ebf8ff'};
  color: ${props => props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2b4c7e' : '#bee3f8'};
  }
`;

const EditButton = styled(ActionButton)`
  background-color: ${props => props.theme === 'dark' ? '#2c7a7b' : '#e6fffa'};
  color: ${props => props.theme === 'dark' ? '#81e6d9' : '#319795'};
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#296f6f' : '#b2f5ea'};
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: ${props => props.theme === 'dark' ? '#9b2c2c' : '#fff5f5'};
  color: ${props => props.theme === 'dark' ? '#feb2b2' : '#e53e3e'};
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#8a2727' : '#fed7d7'};
  }
`;

// Format date helper function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Format file size helper function 
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
    default:
      return <FaFile />;
  }
};

const MaterialDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMaterialDetails = async () => {
      try {
        setLoading(true);
        const response = await getMaterialById(id);
        
        if (response.success && response.data) {
          setMaterial(response.data);
        } else {
          showErrorToast('Không tìm thấy tài liệu');
          navigate('/teacher/materials');
        }
      } catch (error) {
        console.error('Error fetching material details:', error);
        showErrorToast('Không thể tải thông tin tài liệu');
        navigate('/teacher/materials');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterialDetails();
  }, [id, navigate]);
  
  // Handle back button click
  const handleBack = () => {
    navigate('/teacher/materials');
  };
  
  // Handle delete button click
  const handleDelete = () => {
    // Implement delete functionality here
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      // Call API to delete the material
      console.log('Delete material:', id);
    }
  };
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container>
        <BackButton theme={theme} onClick={handleBack}>
          <FaArrowLeft />
          Quay lại danh sách tài liệu
        </BackButton>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <LoadingSpinner size={40} />
          </div>
        ) : material ? (
          <DetailCard 
            theme={theme}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DetailHeader theme={theme}>
              <DetailTitle theme={theme}>{material.title}</DetailTitle>
              <DetailDescription theme={theme}>{material.description}</DetailDescription>
            </DetailHeader>
            
            <DetailContent>
              <PreviewSection theme={theme}>
                {material.thumbnailUrl ? (
                  <PreviewImage 
                    src={`${API_URL}${material.thumbnailUrl}`} 
                    alt={material.title} 
                    theme={theme}
                  />
                ) : (
                  <PreviewIcon theme={theme}>
                    {getFileIcon(material.fileType || material.documentType)}
                  </PreviewIcon>
                )}
                <PreviewText theme={theme}>
                  {material.fileType || material.documentType} file ({formatBytes(material.fileSize)})
                </PreviewText>
              </PreviewSection>
              
              <MetadataSection>
                <MetadataGroup>
                  <MetadataTitle theme={theme}>Thông tin tài liệu</MetadataTitle>
                  
                  <MetadataItem>
                    <FaLayerGroup />
                    <MetadataLabel theme={theme}>Môn học:</MetadataLabel>
                    <MetadataValue theme={theme}>{material.subjectName}</MetadataValue>
                  </MetadataItem>
                  
                  {material.chapterName && (
                    <MetadataItem>
                      <FaBook />
                      <MetadataLabel theme={theme}>Chương:</MetadataLabel>
                      <MetadataValue theme={theme}>{material.chapterName}</MetadataValue>
                    </MetadataItem>
                  )}
                  
                  <MetadataItem>
                    <FaCalendarAlt />
                    <MetadataLabel theme={theme}>Ngày tạo:</MetadataLabel>
                    <MetadataValue theme={theme}>{formatDate(material.createdAt)}</MetadataValue>
                  </MetadataItem>
                  
                  <MetadataItem>
                    <FaDownloadCount />
                    <MetadataLabel theme={theme}>Lượt tải:</MetadataLabel>
                    <MetadataValue theme={theme}>{material.downloadCount}</MetadataValue>
                  </MetadataItem>
                </MetadataGroup>
                
                {material.tags && (
                  <MetadataGroup>
                    <MetadataTitle theme={theme}>Thẻ</MetadataTitle>
                    <TagsContainer>
                      {material.tags.split(',').map((tag, index) => (
                        <Tag key={index} theme={theme}>
                          <FaTag />
                          {tag.trim()}
                        </Tag>
                      ))}
                    </TagsContainer>
                  </MetadataGroup>
                )}
                
                <ButtonsContainer>
                  <DownloadButton 
                    href={`${API_URL}${material.url}`} 
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaDownload />
                    Tải xuống
                  </DownloadButton>
                  
                  <ViewButton 
                    href={`${API_URL}${material.url}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    theme={theme}
                  >
                    <FaEye />
                    Xem tài liệu
                  </ViewButton>
                  
                  <EditButton as="button" theme={theme}>
                    <FaEdit />
                    Chỉnh sửa
                  </EditButton>
                  
                  <DeleteButton as="button" theme={theme} onClick={handleDelete}>
                    <FaTrash />
                    Xóa
                  </DeleteButton>
                </ButtonsContainer>
              </MetadataSection>
            </DetailContent>
          </DetailCard>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <h2>Không tìm thấy tài liệu</h2>
            <p>Tài liệu này có thể đã bị xóa hoặc không tồn tại.</p>
          </div>
        )}
      </Container>
      <Footer />
    </PageWrapper>
  );
};

export default MaterialDetails;