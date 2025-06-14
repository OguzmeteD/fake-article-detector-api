import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import ArticleTest from './pages/test/ArticleTest';
import Profile from './pages/user/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Statistics from './pages/analytics';
import Trends from './pages/trends';
import Settings from './pages/user/Settings';
import { Box, useMediaQuery, PaletteMode } from '@mui/material';
import Navigation from './components/Navigation';
import { useMemo, useState, useEffect } from 'react';

const getDesignTokens = (mode: PaletteMode, fontFamily: string) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // light mode
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
        }
      : {
          // dark mode
          primary: {
            main: '#90caf9',
          },
          secondary: {
            main: '#f48fb1',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        }),
  },
  typography: {
    fontFamily,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none' as const,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(25, 118, 210, 0.9)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
  },
});

const Authenticated = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const rawTheme = localStorage.getItem('appTheme');
  const storedTheme: PaletteMode | undefined = rawTheme === 'dark' || rawTheme === 'light' ? rawTheme : undefined;
  const storedFont = localStorage.getItem('appFont') || 'Roboto';

  const [mode, setMode] = useState<PaletteMode>(storedTheme ?? (prefersDarkMode ? 'dark' : 'light'));
  const [font] = useState<string>(storedFont);

  // Sistem teması değişikliklerini dinle
  useEffect(() => {
    setMode(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  // Tema değişikliği için fonksiyon
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  // Tema ayarlarını oluştur
  const theme = useMemo(() => createTheme(getDesignTokens(mode, font)), [mode, font]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Box sx={{ 
        minHeight: '100vh',
        pt: { xs: 8, sm: 12 },
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        transition: 'background 0.3s ease, color 0.3s ease',
      }}>
        <Navigation colorMode={colorMode} mode={mode} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<ArticleTest />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/analytics" element={<Statistics />} />
          <Route path="/history" element={<Trends />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Authenticated />
    </AuthProvider>
  );
};

export default App;