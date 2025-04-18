import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, CircularProgress, Container, Typography } from '@mui/material';
import { authService } from '@/lib/services';

const GitHubCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for GitHub OAuth errors first
        const oauthError = searchParams.get('error');
        if (oauthError) {
          throw new Error(`GitHub OAuth Error: ${oauthError} - ${searchParams.get('error_description')}`);
        }

        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          throw new Error('Missing required parameters: code or state');
        }

        // Handle the callback with both code and state
        await authService.handleCallback(code, state);
        
        // Check if the connection is working
        const isConnected = await authService.testGitHubConnection();
        if (!isConnected) {
          throw new Error('Failed to establish GitHub connection');
        }

        // Redirect to settings on success
        navigate('/settings');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please try:
          <ul>
            <li>Clearing your browser cache and cookies</li>
            <li>Using the same browser tab that initiated the login</li>
            <li>Starting the login process again</li>
          </ul>
        </Typography>
        <Typography>
          <a href="/login" style={{ color: 'primary' }}>Return to login page</a>
        </Typography>
      </Container>
    );
  }

  return (
    <Container 
      sx={{ 
        mt: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 2 
      }}
    >
      <CircularProgress />
      <Typography>
        Completing GitHub authentication...
      </Typography>
    </Container>
  );
};

export default GitHubCallbackPage; 