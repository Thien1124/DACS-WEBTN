// Example for admin panel to send notifications
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import NotificationService from '../../services/NotificationService';

const NotificationSender = () => {
  const { token } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({
    userIds: [],
    title: '',
    content: '',
    type: 0,
    link: '',
    relatedEntityId: null,
    relatedEntityType: '',
    sendEmail: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'userIds' && type === 'text' 
          ? value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          : name === 'relatedEntityId' && value === ''
            ? null
            : name === 'relatedEntityId'
              ? parseInt(value)
              : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await NotificationService.sendInAppNotification(token, formData);
      setSuccess(true);
      setFormData({
        userIds: [],
        title: '',
        content: '',
        type: 0,
        link: '',
        relatedEntityId: null,
        relatedEntityType: '',
        sendEmail: false
      });
    } catch (err) {
      setError('Không thể gửi thông báo. Vui lòng thử lại.');
      console.error('Error sending notification:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="notification-sender-container">
      <h2>Gửi thông báo</h2>
      
      {success && (
        <div className="success-message">Đã gửi thông báo thành công!</div>
      )}
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID người dùng (nhiều ID cách nhau bằng dấu phẩy)</label>
          <input
            type="text"
            name="userIds"
            value={formData.userIds.join(', ')}
            onChange={handleChange}
            placeholder="VD: 1, 2, 3"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Tiêu đề</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Tiêu đề thông báo"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Nội dung</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Nội dung thông báo"
            required
            rows={4}
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>Loại thông báo</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value={0}>Hệ thống</option>
            <option value={1}>Kỳ thi</option>
            <option value={2}>Kết quả</option>
            <option value={3}>Cảnh báo</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Liên kết (tùy chọn)</label>
          <input
            type="text"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="/duong-dan-lien-ket"
          />
        </div>
        
        <div className="form-group">
          <label>ID đối tượng liên quan (tùy chọn)</label>
          <input
            type="number"
            name="relatedEntityId"
            value={formData.relatedEntityId || ''}
            onChange={handleChange}
            placeholder="ID của kỳ thi hoặc kết quả"
          />
        </div>
        
        <div className="form-group">
          <label>Loại đối tượng (tùy chọn)</label>
          <input
            type="text"
            name="relatedEntityType"
            value={formData.relatedEntityType}
            onChange={handleChange}
            placeholder="VD: exam, result"
          />
        </div>
        
        <div className="form-group checkbox">
          <input
            type="checkbox"
            name="sendEmail"
            id="sendEmail"
            checked={formData.sendEmail}
            onChange={handleChange}
          />
          <label htmlFor="sendEmail">Gửi kèm email</label>
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi thông báo'}
        </button>
      </form>
    </div>
  );
};

export default NotificationSender;