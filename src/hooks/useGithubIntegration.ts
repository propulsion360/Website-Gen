import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Website } from '@/types/website';
import {
  GitHubCredentials,
  GitHubRepo,
  GitHubError,
  CreateRepoParams,
  GitHubCommitFile,
  WebsiteToRepoMapping
} from '@/types/github';
import { useLocalStorage } from './useLocalStorage';

interface ClientInfo {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const useGithubIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [credentials, setCredentials] = useLocalStorage<GitHubCredentials | null>('github_credentials', null);
  const [templates, setTemplates] = useState<GitHubRepo[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [websiteRepos, setWebsiteRepos] = useState<WebsiteToRepoMapping[]>([]);

  const githubFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!credentials) throw new Error('Not connected to GitHub');

    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }, [credentials]);

  useEffect(() => {
    if (credentials) {
      setIsConnected(true);
      fetchTemplateRepos();
    } else {
      setIsConnected(false);
      setTemplates([]);
    }
  }, [credentials]);

  const fetchTemplateRepos = async () => {
    if (!credentials) return;

    setIsLoadingTemplates(true);
    try {
      // First try to get user's repos
      const userRepos = await githubFetch('/user/repos?per_page=100');
      
      // Filter for template repos
      const templateRepos = userRepos.filter((repo: GitHubRepo) => 
        repo.name.toLowerCase().startsWith('template-')
      ).map((repo: GitHubRepo) => ({
        ...repo,
        type: 'template',
        description: repo.description || 'No description provided',
        lastUpdated: new Date(repo.updated_at),
        stars: repo.stargazers_count,
      }));

      setTemplates(templateRepos);
    } catch (error) {
      handleGitHubError(error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleGitHubError = (error: any) => {
    if (error instanceof GitHubError) {
      switch (error.status) {
        case 401:
          toast.error('GitHub authentication failed. Please reconnect.');
          disconnectGithub();
          break;
        case 403:
          toast.error('GitHub API rate limit exceeded or insufficient permissions.');
          break;
        case 404:
          toast.error('Resource not found on GitHub.');
          break;
        default:
          toast.error(`GitHub Error: ${error.message}`);
      }
    } else {
      console.error('GitHub operation failed:', error);
      toast.error('Failed to complete GitHub operation');
    }
  };

  const createRepository = async (params: CreateRepoParams): Promise<GitHubRepo> => {
    try {
      const endpoint = '/user/repos';
      return await githubFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          ...params,
          auto_init: true,
          private: params.private ?? true,
        }),
      });
    } catch (error) {
      handleGitHubError(error);
      throw error;
    }
  };

  const commitFiles = async (repo: string, files: GitHubCommitFile[], message: string) => {
    if (!credentials?.username) return false;

    try {
      // Get the default branch's latest commit SHA
      const branchData = await githubFetch(`/repos/${credentials.username}/${repo}/branches/main`);
      const baseSha = branchData.commit.sha;

      // Create blobs for each file
      const blobPromises = files.map(file => 
        githubFetch(`/repos/${credentials.username}/${repo}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({
            content: file.content,
            encoding: file.encoding || 'utf-8',
          }),
        })
      );

      const blobs = await Promise.all(blobPromises);

      // Create tree
      const tree = await githubFetch(`/repos/${credentials.username}/${repo}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({
          base_tree: baseSha,
          tree: files.map((file, index) => ({
            path: file.path,
            mode: '100644',
            type: 'blob',
            sha: blobs[index].sha
          })),
        })
      });

      // Create commit
      const commit = await githubFetch(`/repos/${credentials.username}/${repo}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({
          message,
          tree: tree.sha,
          parents: [baseSha],
        }),
      });

      // Update reference
      await githubFetch(`/repos/${credentials.username}/${repo}/git/refs/heads/main`, {
        method: 'PATCH',
        body: JSON.stringify({
          sha: commit.sha,
          force: true,
        }),
      });

      return true;
    } catch (error) {
      handleGitHubError(error);
      return false;
    }
  };

  const pushToGithub = async (files: GitHubCommitFile[], repoName: string) => {
    if (!credentials) return false;

    try {
      for (const file of files) {
        const content = Buffer.from(file.content).toString('base64');
        await githubFetch(`/repos/${credentials.username}/${repoName}/contents/${file.path}`, {
          method: 'PUT',
          body: JSON.stringify({
            message: file.message,
            content: content,
          }),
        });
      }
      return true;
    } catch (error) {
      console.error('Failed to push to GitHub:', error);
      return false;
    }
  };

  const connectToGithub = async (credentials: GitHubCredentials) => {
    try {
      setIsConnecting(true);
      // Test the connection
      await githubFetch('/user');
      setCredentials(credentials);
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Failed to connect to GitHub:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGithub = () => {
    setCredentials(null);
    setIsConnected(false);
    setTemplates([]);
    setWebsiteRepos([]);
    toast.success('Disconnected from GitHub');
  };

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (credentials?.accessToken) {
        try {
          const response = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `token ${credentials.accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            }
          });
          
          if (response.ok) {
            setIsConnected(true);
            await fetchTemplateRepos();
          } else {
            // Token is invalid
            disconnectGithub();
          }
        } catch (error) {
          console.error('Failed to verify GitHub connection:', error);
          disconnectGithub();
        }
      } else {
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  const getRepositoryUrl = (repoName: string) => {
    if (!credentials) return '';
    return `https://github.com/${credentials.username}/${repoName}`;
  };

  const refreshTemplates = () => {
    return fetchTemplateRepos();
  };

  const processTemplateContent = (content: string, clientInfo: ClientInfo): string => {
    const replacements = {
      '{{businessName}}': clientInfo.businessName,
      '{{contactName}}': clientInfo.contactName,
      '{{email}}': clientInfo.email,
      '{{phone}}': clientInfo.phone,
      '{{address}}': clientInfo.address,
      '{{primaryColor}}': clientInfo.primaryColor,
      '{{secondaryColor}}': clientInfo.secondaryColor,
      '{{accentColor}}': clientInfo.accentColor,
    };

    let processedContent = content;
    for (const [placeholder, value] of Object.entries(replacements)) {
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    }

    return processedContent;
  };

  const cloneTemplate = async (templateRepo: GitHubRepo, newRepoName: string, placeholderValues: Record<string, string>) => {
    if (!credentials) throw new GitHubError('Not connected to GitHub');

    try {
      // 1. Create a new repository
      const newRepo = await githubFetch('/user/repos', {
        method: 'POST',
        body: JSON.stringify({
          name: newRepoName,
          description: `Website generated from template ${templateRepo.name}`,
          private: true,
          auto_init: false,
        }),
      });

      // 2. Get template repository contents
      const contents = await githubFetch(`/repos/${templateRepo.full_name}/contents`);

      // 3. Copy each file from template to new repo, replacing placeholders
      for (const file of contents) {
        const fileContent = await githubFetch(file.url);
        const decodedContent = Buffer.from(fileContent.content, 'base64').toString('utf-8');
        
        // Replace placeholders with provided values
        let processedContent = decodedContent;
        Object.entries(placeholderValues).forEach(([key, value]) => {
          const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          processedContent = processedContent.replace(placeholder, value);
        });
        
        await githubFetch(`/repos/${credentials.username}/${newRepoName}/contents/${file.path}`, {
          method: 'PUT',
          body: JSON.stringify({
            message: `Add ${file.path} from template`,
            content: Buffer.from(processedContent).toString('base64'),
          }),
        });
      }

      return newRepo;
    } catch (error) {
      handleGitHubError(error);
      throw error;
    }
  };

  return {
    isConnecting,
    isConnected,
    connectToGithub,
    disconnectGithub,
    pushToGithub,
    createRepository,
    commitFiles,
    getRepositoryUrl,
    credentials,
    templates,
    isLoadingTemplates,
    websiteRepos,
    refreshTemplates,
    cloneTemplate,
    githubFetch,
  };
};

export default useGithubIntegration;
