import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Sau này có thêm categories, transactions thì bỏ vào đây
  },
});

// Xuất các Type này để dùng với TypeScript cho chuẩn
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;