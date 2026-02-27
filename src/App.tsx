import type { RootState } from './store';
import { useSelector, useDispatch } from 'react-redux';
import Login from './Login';
import Dashboard from './Dashboard';
import { Box, Typography, Button, Container, AppBar, Toolbar } from '@mui/material';
import { logout } from './store/authSlice';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      {!isAuthenticated ? (
        <Login />
      ) : (
        <>
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <AccountBalanceWalletIcon sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                Expense Tracker
              </Typography>
              <Button color="inherit" onClick={() => dispatch(logout())}>
                Đăng xuất
              </Button>
            </Toolbar>
          </AppBar>

          {/* Dùng maxWidth="lg" để giao diện vừa vặn, không bị banh chành trên màn hình to */}
          <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Dashboard />
          </Container>
        </>
      )}
    </Box>
  );
}

export default App;