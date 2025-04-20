import { mockExams } from './examData';

// Giả lập độ trễ của mạng
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm lọc đề thi theo nhiều điều kiện
const filterExams = (exams, filters) => {
  let filtered = [...exams];

  // Lọc theo từ khóa tìm kiếm
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(exam => 
      exam.title.toLowerCase().includes(searchLower) ||
      exam.description.toLowerCase().includes(searchLower)
    );
  }

  // Lọc theo môn học
  if (filters.subjectId) {
    filtered = filtered.filter(exam => exam.subjectId === Number(filters.subjectId));
  }

  // Lọc theo trạng thái (active/inactive)
  if (filters.activeOnly === 'true') {
    filtered = filtered.filter(exam => exam.isActive);
  } else if (filters.activeOnly === 'false') {
    filtered = filtered.filter(exam => !exam.isActive);
  }

  // Lọc theo trạng thái phê duyệt
  if (filters.isApproved === 'true') {
    filtered = filtered.filter(exam => exam.isApproved);
  } else if (filters.isApproved === 'false') {
    filtered = filtered.filter(exam => !exam.isApproved);
  }

  return filtered;
};

// Hàm phân trang kết quả
const paginateResults = (items, page, pageSize) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return items.slice(startIndex, endIndex);
};

// Mock API để lấy danh sách đề thi
export const mockGetExams = async (params = {}) => {
  // Thêm delay để giả lập thời gian tải
  await delay(800);

  // Parse các tham số
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const searchTerm = params.searchTerm || params.SearchTerm || '';
  const subjectId = params.subjectId;
  const activeOnly = params.activeOnly;
  const isApproved = params.isApproved;

  // Áp dụng các bộ lọc
  const filtered = filterExams(mockExams, { 
    searchTerm, 
    subjectId, 
    activeOnly, 
    isApproved 
  });

  // Áp dụng phân trang
  const paginatedItems = paginateResults(filtered, page, pageSize);

  // Trả về kết quả định dạng giống API thật
  return {
    items: paginatedItems,
    totalItems: filtered.length,
    currentPage: page,
    totalPages: Math.ceil(filtered.length / pageSize)
  };
};

// Mock API để lấy chi tiết đề thi
export const mockGetExamById = async (id) => {
  await delay(500);
  const exam = mockExams.find(exam => exam.id === Number(id));
  if (!exam) {
    throw new Error('Không tìm thấy đề thi với ID đã cho');
  }
  return exam;
};

// Mock API để tạo đề thi mới
export const mockCreateExam = async (examData) => {
  await delay(1000);
  
  // Tạo ID mới (thường server sẽ làm việc này)
  const newId = Math.max(...mockExams.map(e => e.id)) + 1;
  
  const newExam = {
    id: newId,
    ...examData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Thêm vào danh sách mock (không thực sự lưu lại giữa các session)
  mockExams.push(newExam);
  
  return newExam;
};

// Mock API để cập nhật đề thi
export const mockUpdateExam = async (id, examData) => {
  await delay(800);
  
  const examIndex = mockExams.findIndex(exam => exam.id === Number(id));
  if (examIndex === -1) {
    throw new Error('Không tìm thấy đề thi với ID đã cho');
  }
  
  const updatedExam = {
    ...mockExams[examIndex],
    ...examData,
    updatedAt: new Date().toISOString()
  };
  
  mockExams[examIndex] = updatedExam;
  
  return updatedExam;
};

// Mock API để xóa đề thi
export const mockDeleteExam = async (id) => {
  await delay(700);
  
  const examIndex = mockExams.findIndex(exam => exam.id === Number(id));
  if (examIndex === -1) {
    throw new Error('Không tìm thấy đề thi với ID đã cho');
  }
  
  mockExams.splice(examIndex, 1);
  
  return { success: true, message: 'Đã xóa đề thi thành công' };
};

// Mock API để phê duyệt đề thi
export const mockApproveExam = async (id) => {
  await delay(600);
  
  const examIndex = mockExams.findIndex(exam => exam.id === Number(id));
  if (examIndex === -1) {
    throw new Error('Không tìm thấy đề thi với ID đã cho');
  }
  
  mockExams[examIndex].isApproved = true;
  mockExams[examIndex].updatedAt = new Date().toISOString();
  
  return mockExams[examIndex];
};