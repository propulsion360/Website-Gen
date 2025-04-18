import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/services/authService';
import { Github } from 'lucide-react';
import { toast } from 'sonner';

export function GitHubAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const authService = AuthService.getInstance(
    import.meta.env.VITE_GITHUB_CLIENT_ID,
    import.meta.env.VITE_GITHUB_CLIENT_SECRET
  );

  useEffect(() => {
    // Check if we're handling a callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      handleCallback(code, state);
    }
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    try {
      const loginUrl = authService.getLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to initialize GitHub login');
      setIsLoading(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    setIsLoading(true);
    try {
      await authService.handleCallback(code, state);
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      toast.success('Successfully connected to GitHub');
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Failed to authenticate with GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.clearToken();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (authService.isAuthenticated()) {
    return (
      <Button
        variant="outline"
        onClick={handleLogout}
        disabled={isLoading}
      >
        Disconnect GitHub
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <Github className="w-4 h-4" />
      {isLoading ? 'Connecting...' : 'Connect GitHub'}
    </Button>
  );
} 