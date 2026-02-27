import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Provider } from 'react-redux'; // <--- Import Provider
import { store } from './store'; // <--- Import Store vừa tạo
import CssBaseline from '@mui/material/CssBaseline'; // Mặc định reset CSS của Material-UI

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <CssBaseline />
      <App />
    </Provider>
  </React.StrictMode>,
);