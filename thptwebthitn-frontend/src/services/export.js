import apiClient from "./apiClient";

/**
 * Export student list by classroom
 * @param {string} classroomName - Name of the classroom
 * @returns {Promise} - Promise object representing the API response
 */
export const exportStudentsByClassroom = async (classroomName) => {
    try {
        const response = await apiClient.post('/api/students/export', { classroomName }, {
            responseType: 'blob' // Important for handling file downloads
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Export scores by official exam
 * @param {number} officialExamId - ID of the official exam
 * @returns {Promise} - Promise object representing the API response
 */
export const exportScoresByExam = async (officialExamId) => {
    try {
        const response = await apiClient.post('/api/scores/export', { officialExamId }, {
            responseType: 'blob' // Important for handling file downloads
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Helper function to download the exported file
 * @param {Blob} blob - The file blob
 * @param {string} filename - Name for the downloaded file
 */
export const downloadExportedFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};