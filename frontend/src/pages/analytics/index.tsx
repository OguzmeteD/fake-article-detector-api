import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ArticleIcon from '@mui/icons-material/Article';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface CountResponse {
  count: number;
}
interface AccuracyResponse {
  accuracy: number;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <Card>
    <CardContent>
      <Grid container alignItems="center" spacing={2}>
        <Grid item>{icon}</Grid>
        <Grid item>
          <Typography variant="subtitle2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h6">{value}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const Statistics: React.FC = () => {
  const {
    data: predictionCount,
    isLoading: loadingCount,
    isError: errorCount,
  } = useQuery<CountResponse, Error>({
    queryKey: ['predictionCount'],
    queryFn: async () => {
      try {
        const res = await api.get<CountResponse>('/prediction-count');
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 403) return null;
        throw err;
      }
    },
  });

  const {
    data: accuracy,
    isLoading: loadingAcc,
    isError: errorAcc,
  } = useQuery<AccuracyResponse, Error>({
    queryKey: ['predictionAccuracy'],
    queryFn: async () => {
      try {
        const res = await api.get<AccuracyResponse>('/prediction-accuracy');
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 403) return null;
        throw err;
      }
    },
  });

  const {
    data: feedbackCount,
    isLoading: loadingFb,
    isError: errorFb,
  } = useQuery<CountResponse, Error>({
    queryKey: ['feedbackCount'],
    queryFn: async () => {
      try {
        const res = await api.get<CountResponse>('/feedback-count');
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 403) return null;
        throw err;
      }
    },
  });

  if (loadingCount || loadingAcc || loadingFb) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if ((predictionCount === null && accuracy === null && feedbackCount === null)) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Bu istatistiklere yalnızca yönetici kullanıcılar erişebilir.</Alert>
      </Container>
    );
  }

  if (errorCount || errorAcc || errorFb || !predictionCount || !accuracy || !feedbackCount) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">İstatistikler yüklenemedi.</Alert>
      </Container>
    );
  }

  const pieData = [
    { name: 'Doğru', value: Math.round((accuracy?.accuracy ?? 0) * 100) },
    { name: 'Yanlış', value: Math.round(100 - (accuracy?.accuracy ?? 0) * 100) },
  ];

  const lineData = [
    { name: 'Tahmin', value: predictionCount?.count ?? 0 },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        İstatistikler
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Toplam Tahmin"
            value={predictionCount?.count ?? 0}
            icon={<ArticleIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Doğruluk" 
            value={`${((accuracy?.accuracy ?? 0) * 100).toFixed(1)}%`}
            icon={<AnalyticsIcon color="secondary" />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Gönderilen Geri Bildirim"
            value={feedbackCount?.count ?? 0}
            icon={<RateReviewIcon color="action" />}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Doğruluk Dağılımı
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#2196f3' : '#ff9800'} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Toplam Tahmin Grafiği (Demo)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#2196f3" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Statistics;
