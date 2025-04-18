import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import { authService } from '@/lib/services';

const LoginPage: React.FC = () => {
  const handleGitHubLogin = () => {
    window.location.href = authService.getAuthUrl();
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        <Typography variant="h4" component="h1">
          Welcome
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center">
          Sign in with GitHub to start generating websites
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<GitHubIcon />}
          onClick={handleGitHubLogin}
          sx={{ mt: 2 }}
        >
          Continue with GitHub
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage; 