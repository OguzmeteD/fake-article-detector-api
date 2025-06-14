import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Link,
  Snackbar,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from "../../api/axios";

interface LoginResponse {
  access_token: string;
  role: 'admin' | 'user';
  token_type: string;
}

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Check for success messages in URL params
  useEffect(() => {
    if (searchParams.get('logout') === 'success') {
      setSuccessMessage('Başarıyla çıkış yapıldı. Tekrar giriş yapabilirsiniz.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurunuz');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post<LoginResponse>('/signin', { 
        email: email.trim(), 
        password 
      });
      
      if (response.data?.access_token && response.data?.role) {
        await login(response.data.access_token, response.data.role);
        // Navigation is handled in the login function
      } else {
        throw new Error('Geçersiz yanıt alındı');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          setError('Geçersiz e-posta veya şifre');
        } else if (error.response.status >= 500) {
          setError('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.');
        } else if (error.response.data?.detail) {
          setError(error.response.data.detail);
        } else {
          setError('Giriş yapılırken bir hata oluştu');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        // Something happened in setting up the request
        setError(error.message || 'Beklenmeyen bir hata oluştu');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close success message
  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  return (
    <Container 
      component="main" 
      maxWidth="xs"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card 
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Giriş Yap
            </Typography>
          </Box>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Makale benzerlik testi için giriş yapın
          </Typography>
          
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="E-posta"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              disabled={isSubmitting}
            />
            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 1,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: 3
                },
                transition: 'all 0.2s'
              }}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>

          <Box sx={{ my: 3 }}>
            <Divider>veya</Divider>
          </Box>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              Hesabınız yok mu?{' '}
              <Link component={RouterLink} to="/register" color="primary">
                Kayıt Olun
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Error Message */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;