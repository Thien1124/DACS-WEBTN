/**
 * Format độ khó của đề thi sang tiếng Việt
 * @param {string} difficulty - Độ khó (easy, medium, hard)
 * @returns {string} - Độ khó đã định dạng
 */
export const formatDifficulty = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return difficulty || 'Không xác định';
    }
  };
  
  /**
   * Format thời gian từ phút sang dạng "X giờ Y phút"
   * @param {number} minutes - Thời gian tính bằng phút
   * @returns {string} - Thời gian đã định dạng
   */
  export const formatTimeLimit = (minutes) => {
    if (!minutes) return 'Không xác định';
    if (minutes < 60) return `${minutes} phút`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) return `${hours} giờ`;
    return `${hours} giờ ${mins} phút`;
  };