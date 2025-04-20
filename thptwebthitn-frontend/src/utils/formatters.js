/**
 * Format date to locale string
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Format time duration in seconds to a human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export const formatTimeDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hrs > 0) parts.push(`${hrs} giờ`);
  if (mins > 0) parts.push(`${mins} phút`);
  if (secs > 0 || (hrs === 0 && mins === 0)) parts.push(`${secs} giây`);
  
  return parts.join(' ');
};

/**
 * Format duration in seconds to HH:MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours > 0 ? hours : null,
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ]
    .filter(Boolean)
    .join(':');
};

/**
 * Format grade level for display
 * @param {string} grade - Grade level (10, 11, 12)
 * @returns {string} - Formatted grade string
 */
export const formatGradeLevel = (grade) => {
  return grade ? `Lớp ${grade}` : 'Chưa cập nhật lớp';
};

/**
 * Format score with appropriate color based on value
 * @param {number} score - Score value
 * @returns {object} - Object with formatted value and color
 */
export const formatScore = (score) => {
  let color;
  
  if (score >= 8) {
    color = '#2ecc71'; // Green for high scores
  } else if (score >= 6.5) {
    color = '#3498db'; // Blue for good scores
  } else if (score >= 5) {
    color = '#f39c12'; // Orange for average scores
  } else {
    color = '#e74c3c'; // Red for low scores
  }
  
  return {
    value: score.toFixed(1),
    color
  };
};

/**
 * Get the feedback message based on score
 * @param {number} score - Score value
 * @returns {string} - Appropriate feedback message
 */
export const getScoreFeedback = (score) => {
  if (score >= 9) return 'Xuất sắc! Bạn đã nắm vững kiến thức.';
  if (score >= 8) return 'Rất tốt! Bạn đã hiểu hầu hết các khái niệm.';
  if (score >= 7) return 'Tốt! Bạn đã có kiến thức nền tảng vững.';
  if (score >= 6) return 'Khá! Bạn đã nắm được các điểm chính.';
  if (score >= 5) return 'Đạt! Bạn cần ôn tập thêm để củng cố kiến thức.';
  return 'Bạn cần ôn tập lại kiến thức và thử lại.';
};

/**
 * Get difficulty level text
 * @param {string} difficulty - Difficulty level code
 * @returns {string} - Human-readable difficulty text
 */
export const getDifficultyLabel = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return 'Dễ';
    case 'medium':
      return 'Trung bình';
    case 'hard':
      return 'Khó';
    default:
      return 'Không xác định';
  }
};
