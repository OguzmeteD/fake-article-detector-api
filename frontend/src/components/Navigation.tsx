import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  useMediaQuery,
  styled,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Article as ArticleIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ExitToApp as ExitIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StyledAppBar = styled(AppBar)({
  background: 'linear-gradient(120deg, #1976d2 0%, #9c27b0 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
});

const StyledButton = styled(Button)({
  borderRadius: 30,
  textTransform: 'none',
  '&:hover': {
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
});

const StyledAvatar = styled(Avatar)({
  width: 40,
  height: 40,
  margin: 0.5,
});

const menuItems = [
  { text: 'Makale Testi', icon: <ArticleIcon />, path: '/test' },
  { text: 'Trendler', icon: <TrendingIcon />, path: '/trends' },
  { text: 'İstatistikler', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Geçmiş', icon: <HistoryIcon />, path: '/history' },
  { text: 'Ayarlar', icon: <SettingsIcon />, path: '/settings' },
];

interface NavigationProps {
  colorMode: {
    toggleColorMode: () => void;
  };
  mode: 'light' | 'dark';
}

const Navigation = ({ colorMode, mode }: NavigationProps) => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          mb: 2,
        }}
      >
        <StyledAvatar
          alt={user?.username || user?.email || 'Profil'}
        />
        <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: 0.5,
              background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Fake Article Detection
            </Typography>
      </Box>
      <Divider />
      {user && (
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      )}
      <Divider />
      <List>
        <ListItem button onClick={() => navigate('/login')}>
          <ListItemIcon><ExitIcon /></ListItemIcon>
          <ListItemText primary="Çıkış Yap" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: 'none', sm: 'block' },
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Makale Doğrulama Sistemi
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {menuItems.map((item) => (
                <StyledButton
                  key={item.text}
                  startIcon={item.icon}
                  variant={location.pathname === item.path ? 'contained' : 'outlined'}
                  onClick={() => navigate(item.path)}
                >
                  {item.text}
                </StyledButton>
              ))}
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`${mode === 'dark' ? 'Açık' : 'Koyu'} Temaya Geç`}>
              <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
              </IconButton>
            </Tooltip>
            <StyledButton
              color="inherit"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/profile')}
              sx={{
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              {user?.email?.split('@')[0] || 'Profil'}
            </StyledButton>
            <Tooltip title="Çıkış Yap">
              <IconButton color="inherit" onClick={logout}>
                <ExitIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </StyledAppBar>
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 240,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Navigation;
