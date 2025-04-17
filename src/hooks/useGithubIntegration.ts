import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Website } from '@/types/website';

interface GitHubCredentials {
  accessToken: string;
  username: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  default_branch: string;
  updated_at: string;
}

const useGithubIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [credentials, setCredentials] = useState<GitHubCredentials | null>(null);
  const [templates, setTemplates] = useState<GitHubRepo[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  useEffect(() => {
    // Load stored credentials on mount
    const storedCredentials = localStorage.getItem('github_credentials');
    if (storedCredentials) {
      try {
        const parsed = JSON.parse(storedCredentials);
        setCredentials(parsed);
        setIsConnected(true);
        fetchTemplateRepos(parsed.accessToken);
      } catch (error) {
        console.error('Failed to parse stored GitHub credentials:', error);
        localStorage.removeItem('github_credentials');
      }
    }
  }, []);

  const fetchTemplateRepos = async (token: string) => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=100', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const repos: GitHubRepo[] = await response.json();
      const templateRepos = repos.filter(repo => repo.name.startsWith('template-'));
      setTemplates(templateRepos);
    } catch (error) {
      console.error('Error fetching template repos:', error);
      toast.error('Failed to fetch template repositories');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const connectToGithub = async (token: string, username: string) => {
    setIsConnecting(true);
    
    try {
      // Validate the token with a test API call
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Invalid GitHub token');
      }
      
      const userData = await response.json();
      if (userData.login !== username) {
        throw new Error('Username does not match the provided token');
      }
      
      // Store credentials
      const newCredentials = { accessToken: token, username };
      setCredentials(newCredentials);
      localStorage.setItem('github_credentials', JSON.stringify(newCredentials));
      
      // Fetch template repositories
      await fetchTemplateRepos(token);
      
      setIsConnected(true);
      toast.success('Successfully connected to GitHub');
      return true;
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
    credentials,
    templates,
    isLoadingTemplates,
    refreshTemplates: () => credentials && fetchTemplateRepos(credentials.accessToken)
  };
};

export default useGithubIntegration;
