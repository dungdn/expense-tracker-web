import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Khai báo kiểu dữ liệu (TypeScript)
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

// Lấy token từ localStorage (nếu có) khi load lại trang
const tokenFromStorage = localStorage.getItem('token');

const initialState: AuthState = {
  token: tokenFromStorage,
  isAuthenticated: !!tokenFromStorage, // Nếu có token -> true, không có -> false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Hành động khi Đăng nhập thành công
    setCredentials: (state, action: PayloadAction<{ access_token: string }>) => {
      state.token = action.payload.access_token;
      state.isAuthenticated = true;
      // Lưu luôn vào trình duyệt để không bị mất khi F5
      localStorage.setItem('token', action.payload.access_token);
    },
    // Hành động khi Đăng xuất
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;