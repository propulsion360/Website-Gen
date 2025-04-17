
import { useState } from 'react';
import { toast } from 'sonner';
import { Website } from '@/types/website';

interface GitHubCredentials {
  accessToken: string;
  username: string;
}

const useGithubIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [credentials, setCredentials] = useState<GitHubCredentials | null>(null);

  // Try to load credentials from localStorage
  useState(() => {
    const storedCredentials = localStorage.getItem('github_credentials');
    if (storedCredentials) {
      try {
        const parsed = JSON.parse(storedCredentials);
        setCredentials(parsed);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to parse stored GitHub credentials:', error);
        localStorage.removeItem('github_credentials');
      }
    }
  });

  const connectToGithub = async (token?: string, username?: string) => {
    setIsConnecting(true);
    
    try {
      // In a real implementation, this would initiate OAuth flow with GitHub
      // For demo purposes, we're allowing manual token entry or mocking

      if (token && username) {
        // Validate the token with a test API call
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `token ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Invalid GitHub token');
        }
        
        // Store credentials
        const newCredentials = { accessToken: token, username };
        setCredentials(newCredentials);
        localStorage.setItem('github_credentials', JSON.stringify(newCredentials));
        
        setIsConnected(true);
        toast.success('Successfully connected to GitHub');
        return true;
      } else {
        // For demo purposes, simulate successful connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock credentials
        const mockCredentials = { 
          accessToken: 'mock_token_' + Math.random().toString(36).substring(2),
          username: 'demo_user'
        };
        
        setCredentials(mockCredentials);
        localStorage.setItem('github_credentials', JSON.stringify(mockCredentials));
        
        setIsConnected(true);
        toast.success('Demo: Successfully connected to GitHub');
        return true;
      }
    } catch (error) {
      console.error('Failed to connect to GitHub:', error);
      toast.error(`Failed to connect to GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGithub = () => {
    setCredentials(null);
    setIsConnected(false);
    localStorage.removeItem('github_credentials');
    toast.success('Disconnected from GitHub');
  };

  const pushToGithub = async (website: Website) => {
    if (!isConnected || !credentials) {
      toast.error('Please connect to GitHub first');
      return false;
    }

    return new Promise<boolean>((resolve) => {
      toast.promise(
        (async () => {
          try {
            // In a real implementation, this would use GitHub API to:
            // 1. Create a new repository if it doesn't exist
            // 2. Push the website content as files
            // For now, we're simulating with a delay
            await new Promise((r) => setTimeout(r, 2000));
            
            // Simulate API call success
            return true;
          } catch (error) {
            console.error('Error pushing to GitHub:', error);
            throw error;
          }
        })(),
        {
          loading: 'Pushing to GitHub...',
          success: () => {
            resolve(true);
            return `${website.name} successfully pushed to GitHub`;
          },
          error: (err) => {
            resolve(false);
            return `Failed to push to GitHub: ${err instanceof Error ? err.message : 'Unknown error'}`;
          },
        }
      );
    });
  };

  const getRepositoryUrl = (websiteName: string) => {
    if (!credentials) return '';
    
    const repoName = websiteName.toLowerCase().replace(/\s+/g, '-');
    return `https://github.com/${credentials.username}/${repoName}`;
  };

  return {
    isConnecting,
    isConnected,
    connectToGithub,
    disconnectGithub,
    pushToGithub,
    getRepositoryUrl,
    credentials
  };
};

export default useGithubIntegration;
