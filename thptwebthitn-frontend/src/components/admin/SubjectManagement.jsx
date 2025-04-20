import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, 
  IconButton, TablePagination, Box, Alert, Snackbar
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../services/subjectService';
import AdminLayout from '../../layouts/AdminLayout';

const SubjectManagement = () => {
  // State management
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentSubject, setCurrentSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, [page, rowsPerPage]);

  // Fetch subjects with pagination
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects({
        page: page + 1, // API uses 1-based indexing
        pageSize: rowsPerPage
      });
      setSubjects(data.items || []);
      setTotalItems(data.totalItems || 0);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError('Không thể tải danh sách môn học. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Handle dialog open for adding new subject
  const handleAddClick = () => {
    setFormData({
      name: '',
      code: '',
      description: ''
    });
    setFormMode('add');
    setOpenDialog(true);
  };

  // Handle dialog open for editing subject
  const handleEditClick = (subject) => {
    setCurrentSubject(subject);
    setFormData({
      name: subject.name || '',
      code: subject.code || '',
      description: subject.description || ''
    });
    setFormMode('edit');
    setOpenDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (formMode === 'add') {
        await createSubject(formData);
        showSnackbar('Thêm môn học thành công!', 'success');
      } else {
        await updateSubject(currentSubject.id, formData);
        showSnackbar('Cập nhật môn học thành công!', 'success');
      }
      setOpenDialog(false);
      fetchSubjects();
    } catch (err) {
      console.error('Error saving subject:', err);
      showSnackbar(err.message || 'Có lỗi xảy ra khi lưu môn học', 'error');
    }
  };

  // Handle subject deletion
  const handleDeleteClick = async (subjectId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa môn học này không?')) {
      try {
        await deleteSubject(subjectId);
        fetchSubjects();
        showSnackbar('Xóa môn học thành công!', 'success');
      } catch (err) {
        console.error('Error deleting subject:', err);
        showSnackbar(err.message || 'Có lỗi xảy ra khi xóa môn học', 'error');
      }
    }
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Show snackbar notification
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography component="h1" variant="h5" color="primary" gutterBottom>
              Quản lý môn học
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />} 
              onClick={handleAddClick}
            >
              Thêm môn học
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Mã môn</TableCell>
                  <TableCell>Tên môn học</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Đang tải...</TableCell>
                  </TableRow>
                ) : subjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Không có dữ liệu</TableCell>
                  </TableRow>
                ) : (
                  subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>{subject.id}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>{subject.description}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditClick(subject)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(subject.id)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Subject Form Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            {formMode === 'add' ? 'Thêm môn học mới' : 'Chỉnh sửa môn học'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="code"
              label="Mã môn học"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.code}
              onChange={handleInputChange}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              margin="dense"
              name="name"
              label="Tên môn học"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Mô tả"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button onClick={handleSubmit} color="primary" variant="contained">
              {formMode === 'add' ? 'Thêm' : 'Cập nhật'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AdminLayout>
  );
};

export default SubjectManagement;