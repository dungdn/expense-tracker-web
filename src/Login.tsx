import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from './store/authSlice';
import axiosClient from './api/axiosClient';
import { 
  Container, Box, Typography, TextField, Button, Alert, Paper 
} from '@mui/material';

export default function Login() {
  const dispatch = useDispatch();
  
  // Quản lý state của các ô input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn hành vi load lại trang của Form
    setError('');

    try {
      // 1. Gọi API sang NestJS
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
      });

      // 2. Nếu thành công, lấy token và đưa vào Redux
      const { access_token } = response.data;
      dispatch(setCredentials({ access_token }));
      
      alert('Đăng nhập thành công! Đã lưu Token vào Redux.');
    } catch (err: any) {
      // 3. Xử lý lỗi (Sai pass, sai email...)
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Đăng nhập thất bại');
      } else {
        setError('Lỗi kết nối đến Server');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" color="primary" fontWeight="bold">
          Expense Tracker
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Đăng nhập để quản lý chi tiêu
        </Typography>

        {/* Hiện lỗi nếu có */}
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Địa chỉ Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Đăng nhập
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}