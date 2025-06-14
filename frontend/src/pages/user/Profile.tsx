import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  Container, Typography, Avatar, Button, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Snackbar, Alert, IconButton, InputAdornment,
  Box, Card, CardContent, Grid, List, ListItemButton,
  Collapse, CircularProgress, Chip, Paper, Divider
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  Logout as LogoutIcon,
  Visibility, VisibilityOff, ExpandMore, ExpandLess,
  Assignment as AssignmentIcon,
  WarningAmber as WarningAmberIcon, Verified as VerifiedIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Types and Interfaces
type Severity = 'success' | 'error' | 'warning' | 'info';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

interface Prediction {
  id: string;
  input_data: string;
  output_data: {
    label?: string;
    score?: number;
    [key: string]: any;
  };
  created_at: string;
  user_id: string;
  model_name?: string;
  feedback_is_correct?: boolean | null; 
  feedback_created_at?: string | null;
  feedback_comment?: string | null;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: Severity;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

// StatCard Component
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={1}>
        <Box color={color} mr={1}>
          {icon}
        </Box>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h6">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// Format date to a readable format
const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};



const Profile: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for UI elements
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [expandedPrediction, setExpandedPrediction] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // Fetch user data
  const { data: user, isLoading: isUserLoading, error: userError } = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/users/me');
      return response.data;
    }
  });

  // Fetch user predictions
  const { data: predictions = [], isLoading: arePredictionsLoading, error: predictionsError } = useQuery<Prediction[]>({
    queryKey: ['userPredictions'],
    queryFn: async () => {
      const response = await api.get('/predictions/me');
      return response.data;
    },
    enabled: !!user, // Only run if user is fetched
  });

  // Calculate statistics when predictions data changes
  const stats = useMemo(() => {
    if (!predictions) {
      return {
        totalPredictions: 0,
        correctPredictions: 0,
        incorrectPredictions: 0,
      };
    }
    const totalPredictions = predictions.length;
    const correctPredictions = predictions.filter(p => p.feedback_is_correct === true).length;
    const incorrectPredictions = predictions.filter(p => p.feedback_is_correct === false).length;

    return {
      totalPredictions,
      correctPredictions,
      incorrectPredictions,
    };
  }, [predictions]);

  useEffect(() => {
    if (predictionsError) {
      setSnackbar({
        open: true,
        message: 'Tahmin geçmişi yüklenirken bir hata oluştu.',
        severity: 'error',
      });
    }
  }, [predictionsError]);

  // Mutation for password change
  const passwordMutation = useMutation({
    mutationFn: (passwordData: Omit<PasswordForm, 'confirmPassword'>) => 
      api.put('/users/me', passwordData),
    onSuccess: () => {
      setPasswordDialogOpen(false);
      setSnackbar({ open: true, message: 'Şifre başarıyla güncellendi!', severity: 'success' });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Şifre güncellenirken bir hata oluştu.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    },
  });

  // Mutation for feedback submission
  const feedbackMutation = useMutation({
    mutationFn: ({ predictionId, isCorrect }: { predictionId: string; isCorrect: boolean }) =>
      api.post('/submit-feedback', { prediction_id: predictionId, is_correct: isCorrect }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPredictions'] });
      setSnackbar({ open: true, message: 'Geri bildiriminiz için teşekkürler!', severity: 'success' });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Geri bildirim gönderilemedi.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    },
  });

  // Handle password change input
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle feedback submission
  const handleFeedbackSubmit = (predictionId: string, isCorrect: boolean) => {
    feedbackMutation.mutate({ predictionId, isCorrect });
  };

  // Toggle password visibility
  const handleClickShowPassword = (field: 'old' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Toggle prediction expansion
  const handleExpandPrediction = (predictionId: string) => {
    setExpandedPrediction(prev => (prev === predictionId ? null : predictionId));
  };

  // Handle password form submission
  const handleSubmitPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({ open: true, message: 'Yeni şifreler eşleşmiyor.', severity: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
        setSnackbar({ open: true, message: 'Yeni şifre en az 8 karakter olmalıdır.', severity: 'error' });
        return;
    }
    passwordMutation.mutate({ 
      oldPassword: passwordForm.oldPassword, 
      newPassword: passwordForm.newPassword 
    });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isUserLoading) {
    return <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Container>;
  }

  if (userError) {
    return <Container><Alert severity="error">Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapmayı deneyin.</Alert></Container>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
                  {(user.full_name || ' ').charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user.full_name || 'Kullanıcı'}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {user.email}
                </Typography>
                <Button variant="outlined" startIcon={<LockResetIcon />} onClick={() => setPasswordDialogOpen(true)} sx={{ mb: 1, width: '100%' }}>
                  Şifre Değiştir
                </Button>
                <Button variant="contained" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ width: '100%' }}>
                  Çıkış Yap
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics and Prediction History Container */}
        <Grid item xs={12} md={8}>
          {/* Statistics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <StatCard 
                title="Toplam Tahmin"
                value={stats.totalPredictions} 
                icon={<AssignmentIcon />} 
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard 
                title="Doğru Geri Bildirim"
                value={stats.correctPredictions} 
                icon={<VerifiedIcon />} 
                color="#2e7d32"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard 
                title="Yanlış Geri Bildirim"
                value={stats.incorrectPredictions} 
                icon={<WarningAmberIcon />} 
                color="#d32f2f"
              />
            </Grid>
          </Grid>

          {/* Prediction History */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Tahmin Geçmişi</Typography>
              {arePredictionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3}}><CircularProgress /></Box>
              ) : predictions.length === 0 ? (
                <Typography>Henüz bir tahmin yapmadınız.</Typography>
              ) : (
                <List component="nav">
                  {predictions.map((prediction) => {
                    const isExpanded = expandedPrediction === prediction.id;
                    const outputLabel = prediction.output_data?.label?.toLowerCase();
                    const isFake = outputLabel === 'fake' || outputLabel === 'sahte';
                    const hasFeedback = prediction.feedback_is_correct !== null;

                    return (
                      <Paper key={prediction.id} elevation={2} sx={{ mb: 2 }}>
                        <ListItemButton onClick={() => handleExpandPrediction(prediction.id)}>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={1}>
                              <AssignmentIcon color={isFake ? 'error' : 'success'} />
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="body2" noWrap>
                                {prediction.input_data.substring(0, 50)}...
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {prediction.model_name || 'Bilinmeyen Model'}
                              </Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <Chip
                                icon={isFake ? <WarningAmberIcon /> : <VerifiedIcon />}
                                label={isFake ? 'Sahte' : 'Gerçek'}
                                color={isFake ? 'error' : 'success'}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={2}>
                                {hasFeedback ? (
                                    <Chip 
                                        icon={prediction.feedback_is_correct ? <CheckCircleIcon /> : <CancelIcon />}
                                        label="G.Bildirim Verildi"
                                        size="small"
                                        color={prediction.feedback_is_correct ? 'success' : 'error'}
                                        variant="outlined"
                                    />
                                ) : (
                                    <Chip label="G.Bildirim Bekliyor" size="small" variant="outlined" />
                                )}
                            </Grid>
                            <Grid item xs={2}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(prediction.created_at)}
                              </Typography>
                            </Grid>
                            <Grid item xs={1} sx={{ textAlign: 'right' }}>
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </Grid>
                          </Grid>
                        </ListItemButton>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <CardContent>
                            <Typography variant="h6">Tahmin Detayları</Typography>
                            <Typography variant="body2" sx={{ mt: 2, mb: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              <strong>Metin:</strong> {prediction.input_data}
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                    <strong>Model:</strong> {prediction.model_name || 'Bilinmiyor'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                    <strong>Skor:</strong> {prediction.output_data.score ? (prediction.output_data.score * 100).toFixed(2) + '%' : 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Box>
                              <Typography variant="subtitle1" gutterBottom>Geri Bildirim</Typography>
                              {!hasFeedback ? (
                                <Box>
                                  <Typography variant="body2" sx={{ mb: 1 }}>Bu tahmin doğru muydu?</Typography>
                                  <Button
                                    startIcon={<ThumbUpIcon />}
                                    onClick={() => handleFeedbackSubmit(prediction.id, true)}
                                    color="success"
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                  >
                                    Evet
                                  </Button>
                                  <Button
                                    startIcon={<ThumbDownIcon />}
                                    onClick={() => handleFeedbackSubmit(prediction.id, false)}
                                    color="error"
                                    variant="outlined"
                                  >
                                    Hayır
                                  </Button>
                                </Box>
                              ) : (
                                <Box>
                                    <Chip
                                        icon={prediction.feedback_is_correct ? <CheckCircleIcon /> : <CancelIcon />}
                                        label={`Sonuç: ${prediction.feedback_is_correct ? 'Doğru Tahmin' : 'Yanlış Tahmin'}`}
                                        color={prediction.feedback_is_correct ? 'success' : 'error'}
                                        sx={{ mb: 1 }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Geri bildirim zamanı: {prediction.feedback_created_at ? formatDate(prediction.feedback_created_at) : ''}
                                    </Typography>
                                    {prediction.feedback_comment && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Yorum: {prediction.feedback_comment}
                                        </Typography>
                                    )}
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Collapse>
                      </Paper>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Şifre Değiştir</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitPasswordChange} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="oldPassword"
              label="Mevcut Şifre"
              type={showPassword.old ? 'text' : 'password'}
              id="oldPassword"
              autoComplete="current-password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleClickShowPassword('old')}
                      edge="end"
                    >
                      {showPassword.old ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="Yeni Şifre"
              type={showPassword.new ? 'text' : 'password'}
              id="newPassword"
              autoComplete="new-password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleClickShowPassword('new')}
                      edge="end"
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Yeni Şifreyi Onayla"
              type={showPassword.confirm ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleClickShowPassword('confirm')}
                      edge="end"
                    >
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSubmitPasswordChange} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
