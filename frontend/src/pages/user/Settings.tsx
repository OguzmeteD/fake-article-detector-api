import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  MenuItem,
} from '@mui/material';

interface UiPrefs {
  theme: 'light' | 'dark';
  font: string;
}

const Settings: React.FC = () => {
  const [form, setForm] = useState<UiPrefs>(() => ({
    theme: (localStorage.getItem('appTheme') as 'light' | 'dark') || 'light',
    font: localStorage.getItem('appFont') || 'Roboto',
  }));
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Persist UI preferences locally
    if (form.theme) {
      localStorage.setItem('appTheme', form.theme);
    }
    if (form.font) {
      localStorage.setItem('appFont', form.font);
    }
    setSnackbar({ open: true, message: 'Görünüm tercihleri kaydedildi.', severity: 'info' });
    // Refresh to apply immediately (assuming ThemeProvider reads localStorage)
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <Container sx={{ mt: 4 }} maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Ayarlar
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          select
          name="theme"
          label="Tema"
          value={form.theme}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="light">Açık</MenuItem>
          <MenuItem value="dark">Koyu</MenuItem>
        </TextField>
        <TextField
          select
          name="font"
          label="Yazı Fontu"
          value={form.font}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="Roboto">Roboto</MenuItem>
          <MenuItem value="Arial">Arial</MenuItem>
          <MenuItem value="Times New Roman">Times New Roman</MenuItem>
          <MenuItem value="Montserrat">Montserrat</MenuItem>
        </TextField>
        <Button type="submit" variant="contained">
          Kaydet
        </Button>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
