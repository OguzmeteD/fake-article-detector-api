import { createTheme, alpha } from '@mui/material/styles';
import { TypographyStyleOptions } from '@mui/material/styles/createTypography';

// Özel tipografi stilleri
const createCustomTypographyVariant = (
  fontSize: string | { xs: string; sm: string; md: string },
  fontWeight: number,
  lineHeight: number,
  letterSpacing?: string,
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
): TypographyStyleOptions => ({
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textTransform,
});

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3366FF',
      light: '#6690FF',
      dark: '#1939B7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#36B9FF',
      light: '#66CFFF',
      dark: '#0B93D5',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0A1929',
      paper: 'rgba(19, 47, 76, 0.5)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
      main: '#FF5252',
      light: '#FF8A80',
      dark: '#C41C1C',
    },
    warning: {
      main: '#FFB74D',
      light: '#FFE97D',
      dark: '#C88719',
    },
    success: {
      main: '#69F0AE',
      light: '#B9F6CA',
      dark: '#00C853',
    },
    info: {
      main: '#64B5F6',
      light: '#90CAF9',
      dark: '#1E88E5',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: createCustomTypographyVariant(
      { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
      800,
      1.2,
      '-0.02em'
    ),
    h2: createCustomTypographyVariant(
      { xs: '2rem', sm: '2.25rem', md: '2.5rem' },
      700,
      1.3,
      '-0.01em'
    ),
    h3: createCustomTypographyVariant(
      { xs: '1.75rem', sm: '1.875rem', md: '2rem' },
      600,
      1.4,
      '-0.01em'
    ),
    h4: createCustomTypographyVariant(
      { xs: '1.5rem', sm: '1.625rem', md: '1.75rem' },
      600,
      1.4
    ),
    h5: createCustomTypographyVariant(
      { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' },
      500,
      1.5
    ),
    h6: createCustomTypographyVariant(
      { xs: '1.125rem', sm: '1.25rem', md: '1.25rem' },
      500,
      1.5
    ),
    subtitle1: createCustomTypographyVariant('1.125rem', 500, 1.5),
    subtitle2: createCustomTypographyVariant('1rem', 500, 1.57),
    body1: createCustomTypographyVariant('1rem', 400, 1.5),
    body2: createCustomTypographyVariant('0.875rem', 400, 1.57),
    button: createCustomTypographyVariant('0.875rem', 600, 1.75, '0.02857em', 'none'),
    caption: createCustomTypographyVariant('0.75rem', 400, 1.66, '0.03333em'),
    overline: createCustomTypographyVariant('0.75rem', 600, 2.66, '0.08333em', 'uppercase'),
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.2)',
    '0 4px 8px rgba(0,0,0,0.2)',
    '0 6px 12px rgba(0,0,0,0.2)',
    '0 8px 16px rgba(0,0,0,0.2)',
    '0 10px 20px rgba(0,0,0,0.2)',
    '0 12px 24px rgba(0,0,0,0.2)',
    '0 14px 28px rgba(0,0,0,0.2)',
    '0 16px 32px rgba(0,0,0,0.2)',
    '0 18px 36px rgba(0,0,0,0.2)',
    '0 20px 40px rgba(0,0,0,0.2)',
    '0 22px 44px rgba(0,0,0,0.2)',
    '0 24px 48px rgba(0,0,0,0.2)',
    '0 26px 52px rgba(0,0,0,0.2)',
    '0 28px 56px rgba(0,0,0,0.2)',
    '0 30px 60px rgba(0,0,0,0.2)',
    '0 32px 64px rgba(0,0,0,0.2)',
    '0 34px 68px rgba(0,0,0,0.2)',
    '0 36px 72px rgba(0,0,0,0.2)',
    '0 38px 76px rgba(0,0,0,0.2)',
    '0 40px 80px rgba(0,0,0,0.2)',
    '0 42px 84px rgba(0,0,0,0.2)',
    '0 44px 88px rgba(0,0,0,0.2)',
    '0 46px 92px rgba(0,0,0,0.2)',
    '0 48px 96px rgba(0,0,0,0.2)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#6b6b6b #2b2b2b',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 25, 41, 0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 24px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          background: 'linear-gradient(45deg, #3366FF 30%, #36B9FF 90%)',
          boxShadow: '0 4px 12px rgba(51, 102, 255, 0.25)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1939B7 30%, #0B93D5 90%)',
            boxShadow: '0 6px 16px rgba(51, 102, 255, 0.35)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: alpha('#3366FF', 0.5),
          '&:hover': {
            borderColor: '#3366FF',
            backgroundColor: 'rgba(51, 102, 255, 0.08)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          color: 'inherit',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            color: '#3366FF',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(19, 47, 76, 0.4)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(19, 47, 76, 0.4)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3366FF',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(19, 47, 76, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(19, 47, 76, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.MuiChip-filled': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 8,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(51, 102, 255, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(51, 102, 255, 0.12)',
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
}); 