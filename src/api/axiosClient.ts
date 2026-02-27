import axios from 'axios';
// Import store để lấy Token và dispatch action
import { store } from '../store'; 
import { logout } from '../store/authSlice';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000', // Chỉa thẳng vào NestJS Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. BỘ ĐÁNH CHẶN REQUEST (Thêm chìa khóa trước khi ra khỏi cửa)
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy trạng thái hiện tại của Redux Store
    const state = store.getState();
    const token = state.auth.token || localStorage.getItem('token');

    // Nếu có Token, tự động đính kèm vào Header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. BỘ ĐÁNH CHẶN RESPONSE (Kiểm tra lỗi trả về từ Server)
axiosClient.interceptors.response.use(
  (response) => {
    // Nếu API gọi thành công (Status 2xx), cứ để nó đi qua bình thường
    return response;
  },
  (error) => {
    // Lắng nghe lỗi 401: Người lạ hoặc Token đã hết hạn (sau 1 giờ)
    if (error.response && error.response.status === 401) {
      // Ép Đăng xuất ngay lập tức, dọn dẹp Redux và localStorage
      store.dispatch(logout()); 
      
      // Có thể thêm 1 thông báo nhỏ cho user hiểu chuyện gì xảy ra
      // alert('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!');
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;