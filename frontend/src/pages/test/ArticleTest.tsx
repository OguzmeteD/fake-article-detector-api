import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../../api/axios";
import ArticleIcon from '@mui/icons-material/Article';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { styled } from '@mui/material/styles';

interface PredictionResult {
  label: string;
  score: number;
}

interface PredictResponse {
  prediction: PredictionResult[]; // The backend returns a list
  id: string;
}

const StyledCard = styled(Card)(() => ({
  borderRadius: 16,
  background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  },
}));

const ResultBox = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
  color: '#fff',
  borderRadius: 12,
  padding: theme.spacing(2),
  margin: theme.spacing(2, 0),
  boxShadow: '0 4px 15px rgba(77, 182, 172, 0.3)',
}));

const ArticleTest = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Used in TextField rows prop
  const [inputData, setInputData] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const queryClient = useQueryClient();

  const predictMutation = useMutation({
    mutationFn: async (data: { input_text: string }) => {
      const response = await api.post<PredictResponse>('/predict', data);
      return response.data;
    },
    onSuccess: (data) => {
      // The backend returns a list with one item, so we take the first one.
      if (data.prediction && data.prediction.length > 0) {
        setResult(data.prediction[0]);
      }
      setError('');
      // When a new prediction is made, invalidate the userPredictions query
      // so that the list of predictions on the profile page is updated.
      queryClient.invalidateQueries({ queryKey: ['userPredictions'] });
    },
    onError: (error: any) => {
      let errorMessage = 'Tahmin sırasında bir hata oluştu';
      // Check for FastAPI validation errors, which are an array of objects
      if (Array.isArray(error.response?.data?.detail) && error.response.data.detail[0]?.msg) {
        errorMessage = error.response.data.detail[0].msg;
      } 
      // Check for other string-based errors from our custom HTTPErrors
      else if (typeof error.response?.data?.detail === 'string') {
        errorMessage = error.response.data.detail;
      }
      setError(errorMessage);
      setResult(null);
    },
  });

  const predictPdfMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<PredictResponse>('/predict-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.prediction && data.prediction.length > 0) {
        setResult(data.prediction[0]);
      }
      setError('');
      queryClient.invalidateQueries({ queryKey: ['userPredictions'] });
    },
    onError: () => setError('PDF tahmini sırasında hata oluştu'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputData.trim()) {
      setError('Lütfen makale metnini girin');
      return;
    }
    predictMutation.mutate({ input_text: inputData });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      predictPdfMutation.mutate(file);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6, textAlign: 'center' }}>
        <ArticleIcon sx={{ bgcolor: '#1976d2', width: 80, height: 80, mx: 'auto', mb: 2, fontSize: 48, color: '#fff' }} />
        <Typography variant="h3" component="h1" fontWeight={700} color="primary.main" gutterBottom>
          Akademik Makale Benzerlik Tespiti
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', mb: 3 }}>
          Makalenizi girin ve <span style={{ color: '#1976d2', fontWeight: 600 }}>Roberta</span> modeli ile benzerlik tespiti yapın
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          <InfoOutlinedIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
          Makale metnini kontrol etmek için en az 50 kelime girmeniz gerekiyor
        </Typography>
      </Box>

      <StyledCard>
        <CardContent>
          <Button
            variant="contained"
            component="label"
            startIcon={<PictureAsPdfIcon />}
            sx={{ mb: 2 }}
          >
            PDF Yükle
            <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
          </Button>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Makale Metni"
              variant="outlined"
              margin="normal"
              multiline
              rows={isMobile ? 8 : 12}
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              required
              placeholder="Makale metnini buraya yapıştırın..."
              sx={{ 
                background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? '#555' : '#1976d2',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? '#888' : '#1565c0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? '#1976d2' : '#1565c0',
                  },
                  color: theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? '#aaa' : 'rgba(0, 0, 0, 0.6)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                },
                '& .MuiOutlinedInput-input': {
                  color: theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                },
              }}
            />

            {error && (
              <Alert 
                severity="error" 
                icon={<ErrorOutlineIcon />} 
                sx={{ 
                  mt: 2, 
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                {error}
              </Alert>
            )}

            {result && (
              <ResultBox>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Sonuç: {/fake|sahte/i.test(result.label) ? 'Sahte Makale' : 'Gerçek Makale'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Güven Skoru: <span style={{ fontWeight: 700 }}>{(result.score * 100).toFixed(2)}%</span>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Bu sonuç, makalenizin gerçeklik derecesini göstermektedir
                    </Typography>
                  </Grid>
                </Grid>
              </ResultBox>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              sx={{ 
                mt: 3, 
                fontWeight: 700, 
                fontSize: 18, 
                borderRadius: 3,
                background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #66a5ad 0%, #2196f3 100%)',
                },
              }}
              disabled={predictMutation.isPending}
            >
              {predictMutation.isPending ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={24} color="inherit" />
                  <Typography variant="button">İşleniyor...</Typography>
                </Box>
              ) : (
                'Test Et'
              )}
            </Button>
          </form>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default ArticleTest;