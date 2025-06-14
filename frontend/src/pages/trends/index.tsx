import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';

interface TrendItem {
  id: string;
  user_id: string;
  user_email: string | null;
  input_data: string;
  output_data: { label: string; score: number };
  created_at: string;
  model_name: string | null;
}

const Trends: React.FC = () => {
  const { data = [], isLoading, isError } = useQuery<TrendItem[], Error>({
    queryKey: ['trendsData'],
    queryFn: async () => {
      try {
        const res = await api.get<TrendItem[]>('/admin/predictions');
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 403) {
          // Not admin: fallback to user's own predictions
          const res = await api.get<TrendItem[]>('/predictions/me');
          return res.data;
        }
        throw err;
      }
    },
  });

  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Trendler yüklenemedi.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Son Tahminler
      </Typography>
      <Paper>
        <List>
          {(data || []).map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.created_at ? `${new Date(item.created_at).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'medium' })} - ${item.user_email || 'Bilinmeyen Kullanıcı'}` : `Tarih Yok - ${item.user_email || 'Bilinmeyen Kullanıcı'}`}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {(item.input_data || '').slice(0, 150)}...
                    </Typography>
                    <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                      {item.output_data && item.output_data.label ? (
                        <>
                          Sonuç: <strong>{item.output_data.label}</strong> (Skor: {(item.output_data.score * 100).toFixed(2)}%)
                        </>
                      ) : (
                        'Sonuç: Veri Yok'
                      )}
                    </Typography>
                    <Typography variant="caption" component="div">
                      Model: {item.model_name || 'Bilinmiyor'}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default Trends;
