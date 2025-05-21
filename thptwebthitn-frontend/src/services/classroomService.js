import apiClient from './apiClient';

// Get all classrooms with pagination and optional filtering
export const getClassrooms = async (page = 1, pageSize = 10, grade = '') => {
  try {
    const params = { page, pageSize };
    if (grade) params.grade = grade;
    
    const response = await apiClient.get('/api/classrooms', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    throw error;
  }
};

// Get details of a specific classroom
export const getClassroomByName = async (name) => {
  try {
    const response = await apiClient.get(`/api/classrooms/${name}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching classroom ${name}:`, error);
    throw error;
  }
};

// Create a new classroom
export const createClassroom = async (classroomData) => {
  try {
    const response = await apiClient.post('/api/classrooms', classroomData);
    return response.data;
  } catch (error) {
    console.error('Error creating classroom:', error);
    throw error;
  }
};

// Update an existing classroom
export const updateClassroom = async (name, classroomData) => {
  try {
    const response = await apiClient.put(`/api/classrooms/${name}`, classroomData);
    return response.data;
  } catch (error) {
    console.error(`Error updating classroom ${name}:`, error);
    throw error;
  }
};

// Delete a classroom
export const deleteClassroom = async (name) => {
  try {
    const response = await apiClient.delete(`/api/classrooms/${name}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting classroom ${name}:`, error);
    throw error;
  }
};

// Get students in a classroom
export const getClassroomStudents = async (name) => {
  try {
    const response = await apiClient.get(`/api/classrooms/${name}/students`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching students for classroom ${name}:`, error);
    throw error;
  }
};

// Import students from Excel file
export const importStudentsFromExcel = async (classroom, file) => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('classroom', classroom);
    
    const response = await apiClient.post('/api/classrooms/import-students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error importing students to classroom ${classroom}:`, error);
    throw error;
  }
};