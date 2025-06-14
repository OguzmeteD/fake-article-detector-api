import React from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const [mobileMenu, setMobileMenu] = React.useState<null | HTMLElement>(null);
  const [userMenu, setUserMenu] = React.useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenu(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenu(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenu(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenu(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo */}
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                mr: 4,
                fontWeight: 700,
                color: 'text.primary',
                textDecoration: 'none',
                background: 'linear-gradient(45deg, #3366FF 30%, #36B9FF 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Makale Benzerlik Testi
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                <Button
                  component={RouterLink}
                  to="/test"
                  color="inherit"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  Test Et
                </Button>
              </Stack>
            )}

            {/* Desktop Auth Buttons */}
            {!isMobile && (
              <Stack direction="row" spacing={1}>
                {!isAuthenticated ? (
                  <>
                    <Button
                      component={RouterLink}
                      to="/login"
                      color="inherit"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                      }}
                    >
                      Giriş Yap
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(45deg, #3366FF 30%, #36B9FF 90%)',
                        boxShadow: '0 3px 5px 2px rgba(51, 102, 255, .3)',
                      }}
                    >
                      Kayıt Ol
                    </Button>
                  </>
                ) : (
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{ ml: 2 }}
                    aria-controls="user-menu"
                    aria-haspopup="true"
                  >
                    <AccountCircleIcon />
                  </IconButton>
                )}
              </Stack>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
                sx={{ ml: 'auto' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenu}
        open={Boolean(mobileMenu)}
        onClose={handleMobileMenuClose}
        sx={{
          mt: 5,
          '& .MuiPaper-root': {
            backgroundColor: 'rgba(19, 47, 76, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {isAuthenticated && (
          <MenuItem
            component={RouterLink}
            to="/test"
            onClick={handleMobileMenuClose}
          >
            Test Et
          </MenuItem>
        )}
        {!isAuthenticated ? (
          <>
            <MenuItem
              component={RouterLink}
              to="/login"
              onClick={handleMobileMenuClose}
            >
              Giriş Yap
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to="/register"
              onClick={handleMobileMenuClose}
            >
              Kayıt Ol
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              component={RouterLink}
              to="/profile"
              onClick={handleMobileMenuClose}
            >
              Profil
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMobileMenuClose();
                handleLogout();
              }}
            >
              Çıkış Yap
            </MenuItem>
          </>
        )}
      </Menu>

      {/* User Menu */}
      <Menu
        id="user-menu"
        anchorEl={userMenu}
        open={Boolean(userMenu)}
        onClose={handleUserMenuClose}
        sx={{
          mt: 5,
          '& .MuiPaper-root': {
            backgroundColor: 'rgba(19, 47, 76, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <MenuItem
          component={RouterLink}
          to="/profile"
          onClick={handleUserMenuClose}
        >
          Profil
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Çıkış Yap
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          pt: { xs: 8, sm: 9 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 