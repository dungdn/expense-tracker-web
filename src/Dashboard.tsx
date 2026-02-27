import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Grid, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Card, CardContent,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Alert, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axiosClient from './api/axiosClient';

interface Transaction {
  id: number;
  amount: string;
  note: string;
  date: string;
  category: { name: string };
}

interface CategoryReport {
  name: string;
  value: number;
}

interface Category {
  id: number;
  name: string;
}

const COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8A2BE2', '#FF69B4'];

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
};

export default function Dashboard() {
  const [total, setTotal] = useState<number>(0);
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      const [totalRes, catReportRes, transRes, catListRes] = await Promise.all([
        axiosClient.get('/reports/total'),
        axiosClient.get('/reports/category'),
        axiosClient.get('/transactions'),
        axiosClient.get('/categories')
      ]);

      setTotal(totalRes.data.total);
      
      const formattedChartData = catReportRes.data.map((item: any) => ({
        name: item.categoryName,
        value: Number(item.totalAmount)
      }));
      setCategoryReports(formattedChartData);
      setTransactions(transRes.data);
      setCategories(catListRes.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu Dashboard:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSubmitTransaction = async () => {
    setErrorMsg('');
    if (!amount || !categoryId) {
      setErrorMsg('Vui lòng nhập số tiền và chọn danh mục!');
      return;
    }
    try {
      await axiosClient.post('/transactions', {
        amount: Number(amount),
        categoryId: Number(categoryId),
        note: note,
        date: new Date(date).toISOString(),
      });
      setOpenDialog(false);
      setAmount('');
      setNote('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      fetchDashboardData(); 
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi lưu giao dịch');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3} alignItems="stretch">
        
        {/* KHỐI 1: TỔNG CHI TIÊU */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography color="text.secondary" gutterBottom variant="h6">
                Tổng Chi Tiêu
              </Typography>
              <Typography variant="h3" component="div" color="error.main" fontWeight="bold">
                {formatCurrency(total)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KHỐI BIỂU ĐỒ TRÒN (Bên phải) */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
              Cơ cấu chi tiêu
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* TĂNG CHIỀU CAO (height) LÊN 350px ĐỂ BIỂU ĐỒ ĐƯỢC PHÌNH TO RA */}
            <Box sx={{ width: '100%', height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {categoryReports.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryReports}
                      cx="50%"
                      cy="50%"
                      // Đã xóa innerRadius để tạo hình tròn đặc
                      outerRadius="90%" // Tăng viền ngoài lên 90% để lấp đầy không gian
                      dataKey="value"
                      // Nếu bạn muốn hiện lại chữ % trên biểu đồ, hãy bỏ comment dòng bên dưới:
                      // label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryReports.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography color="text.secondary">Chưa có dữ liệu thống kê</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* KHỐI 3: BẢNG LỊCH SỬ GIAO DỊCH */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" color="primary" fontWeight="bold">
                Lịch sử Giao dịch
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                Thêm Giao Dịch
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell><b>Ngày tháng</b></TableCell>
                    <TableCell><b>Danh mục</b></TableCell>
                    <TableCell><b>Diễn giải</b></TableCell>
                    <TableCell align="right"><b>Số tiền</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{new Date(row.date).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <Box component="span" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.85rem' }}>
                            {row.category?.name}
                          </Box>
                        </TableCell>
                        <TableCell>{row.note}</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                          -{formatCurrency(row.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        Bạn chưa có giao dịch nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* DIALOG THÊM GIAO DỊCH */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>Thêm khoản chi tiêu mới</DialogTitle>
        <DialogContent dividers>
          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
          <TextField label="Số tiền (VNĐ)" type="number" fullWidth margin="normal" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Danh mục</InputLabel>
            <Select value={categoryId} label="Danh mục" onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((cat) => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Ghi chú (Tùy chọn)" type="text" fullWidth margin="normal" value={note} onChange={(e) => setNote(e.target.value)} />
          <TextField label="Ngày giao dịch" type="date" fullWidth margin="normal" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Hủy bỏ</Button>
          <Button onClick={handleSubmitTransaction} variant="contained" color="primary">Lưu Giao Dịch</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}