import React, { useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, Button, Avatar, Container, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ArticleIcon from "@mui/icons-material/Article";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AnalyticsIcon from "@mui/icons-material/Analytics";

interface FeatureCardProps {
  children: React.ReactNode;
}

interface FeatureIconProps {
  children: React.ReactNode;
}

const FeatureCard = ({ children }: FeatureCardProps) => {
  return (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: 3, 
      transition: "0.3s", 
      ":hover": { boxShadow: 8, transform: "scale(1.03)" }, 
      background: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
    }}>
      {children}
    </Card>
  );
};

const FeatureIcon = ({ children }: FeatureIconProps) => {
  return (
    <Avatar sx={{ 
      bgcolor: '#1976d2', 
      width: 56, 
      height: 56, 
      mb: 2,
      boxShadow: 8,
    }}>
      {children}
    </Avatar>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/test');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 8,
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          textAlign: 'center',
          mb: 8,
          p: { xs: 2, sm: 4 },
        }}>
          <Avatar 
            sx={{ 
              bgcolor: '#1976d2', 
              width: 120, 
              height: 120, 
              mx: 'auto', 
              mb: 4,
              boxShadow: 8,
            }}
          >
            <ArticleIcon sx={{ fontSize: 72, color: '#fff' }} />
          </Avatar>
          <Typography 
            variant="h2" 
            fontWeight={700} 
            color="primary.main" 
            gutterBottom
            sx={{ 
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Akademik Makale Doğrulama Sistemi
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              mb: 4,
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            Gelişmiş yapay zeka modelleri ile akademik makalelerin gerçeklik durumunu analiz edin. 
            <span style={{ color: '#1976d2', fontWeight: 600 }}>Roberta</span> modeli ile güvenilir sonuçlar alın.
          </Typography>
          {!isAuthenticated && (
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                sx={{ 
                  fontWeight: 600, 
                  px: 6, 
                  py: 1.5, 
                  fontSize: 18, 
                  borderRadius: 30,
                  background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #66a5ad 0%, #2196f3 100%)',
                  },
                }}
                onClick={() => navigate("/login")}
              >
                Giriş Yap
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large" 
                sx={{ 
                  fontWeight: 600, 
                  px: 6, 
                  py: 1.5, 
                  fontSize: 18, 
                  borderRadius: 30,
                  borderWidth: 2,
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    background: 'rgba(25, 118, 210, 0.1)',
                  },
                }}
                onClick={() => navigate("/register")}
              >
                Kayıt Ol
              </Button>
            </Stack>
          )}
        </Box>

        {isAuthenticated && (
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard>
                <CardContent>
                  <FeatureIcon>
                    <ArticleIcon sx={{ fontSize: 32, color: '#fff' }} />
                  </FeatureIcon>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Makale Testi
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    Akademik makalelerin gerçeklik durumunu test edin
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: 16, 
                      borderRadius: 30,
                      background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #66a5ad 0%, #2196f3 100%)',
                      },
                    }}
                    onClick={() => navigate("/test")}
                  >
                    Test Et
                  </Button>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard>
                <CardContent>
                  <FeatureIcon>
                    <TrendingUpIcon sx={{ fontSize: 32, color: '#fff' }} />
                  </FeatureIcon>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Trendler
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    En çok test edilen makaleler ve kategoriler
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    fullWidth 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: 16, 
                      borderRadius: 30,
                      background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #ffab00 0%, #ffb300 100%)',
                      },
                    }}
                    onClick={() => navigate("/trends")}
                  >
                    Trendleri Gör
                  </Button>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard>
                <CardContent>
                  <FeatureIcon>
                    <AnalyticsIcon sx={{ fontSize: 32, color: '#fff' }} />
                  </FeatureIcon>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    İstatistikler
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    Test sonuçlarınızı ve performansınızı analiz edin
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: 16, 
                      borderRadius: 30,
                      background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #66a5ad 0%, #2196f3 100%)',
                      },
                    }}
                    onClick={() => navigate("/analytics")}
                  >
                    İstatistikleri Gör
                  </Button>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Home;