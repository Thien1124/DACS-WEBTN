import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExamsBySubject } from '../../redux/examSlice';
import ExamList from '../exams/ExamList';
import Spinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const ExamBySubject = () => {
  const { subjectId } = useParams();
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(state => state.exams);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    console.log(`Fetching exams for subject ID: ${subjectId}, page: ${currentPage}`);
    
    // Thêm try-catch để theo dõi lỗi
    try {
      dispatch(fetchExamsBySubject({ 
        subjectId, 
        page: currentPage, 
        pageSize: pageSize 
      }))
      .unwrap()
      .then(data => {
        console.log('Fetch success, data:', data);
      })
      .catch(err => {
        console.error('Error in dispatch unwrap:', err);
      });
    } catch (err) {
      console.error('Exception in dispatch:', err);
    }
  }, [dispatch, subjectId, currentPage, pageSize]);

  // Logging for debugging
  useEffect(() => {
    console.log('Current exams state:', list);
    console.log('Loading state:', loading);
    console.log('Error state:', error);
  }, [list, loading, error]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div className="container mx-auto py-8"><Spinner /></div>;
  
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <ErrorDisplay 
          message={error || "Không thể tải danh sách đề thi."} 
          retryAction={() => dispatch(fetchExamsBySubject({ 
            subjectId, 
            page: currentPage, 
            pageSize: pageSize 
          }))} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Đề thi theo môn học</h1>
      
      {list && list.length > 0 ? (
        <ExamList 
          exams={list} 
          currentPage={currentPage}
          totalItems={list.length}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">Không tìm thấy đề thi cho môn học này.</p>
          <p className="text-gray-500 mt-2 text-sm">
            Mã môn học: {subjectId}
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              console.log('Manual reload triggered');
              dispatch(fetchExamsBySubject({ 
                subjectId, 
                page: 1, 
                pageSize: pageSize 
              }));
            }}
          >
            Tải lại
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamBySubject;