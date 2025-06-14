import React, { useState } from 'react';
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
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from "../../api/axios";

interface RegisterResponse {
  user: {
    id: string;
    email: string;
  };
}

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; username: string }) => {
      const response = await api.post<RegisterResponse>('/signup', data);
      return response.data;
    },
    onSuccess: () => {
      // Redirect to login page after successful registration
      navigate('/login', { state: { message: 'Kayıt başarılı! Lütfen giriş yapın.' } });
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail || error?.message || 'Kayıt olurken bir hata oluştu';
      setError(detail);
      console.error('Register error:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      return;
    }

    registerMutation.mutate({ email, password, username });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Kayıt Ol
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          Makale benzerlik testi için hesap oluşturun
        </Typography>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="E-posta"
              variant="outlined"
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Şifre"
              variant="outlined"
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText="En az 8 karakter"
            />
            <TextField
              fullWidth
              label="Şifre Tekrar"
              variant="outlined"
              margin="normal"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              sx={{ mt: 3 }}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Kayıt Ol'
              )}
            </Button>
          </form>

          <Box sx={{ my: 3 }}>
            <Divider>veya</Divider>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={() => {
              // TODO: Implement Gmail registration
              console.log('Gmail registration clicked');
            }}
          >
            Gmail ile Kayıt Ol
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Zaten hesabınız var mı?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Giriş Yap
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;