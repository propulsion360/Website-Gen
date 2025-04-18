import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Github, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import WebsiteDetails from '@/components/websites/WebsiteDetails';
import EditWebsiteDialog from '@/components/websites/EditWebsiteDialog';
import WebsiteTabsContent from '@/components/websites/WebsiteTabsContent';
import GitHubConnectionDialog from '@/components/github/GitHubConnectionDialog';
import useGithubIntegration from '@/hooks/useGithubIntegration';
import { Website } from '@/types/website';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const WebsitesPage = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGitHubDialogOpen, setIsGitHubDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    isConnecting, 
    isConnected, 
    connectToGithub, 
    disconnectGithub,
    pushToGithub, 
    getRepositoryUrl,
    credentials,
    githubFetch
  } = useGithubIntegration();

  // Fetch client websites from GitHub
  useEffect(() => {
    const fetchWebsites = async () => {
      if (!isConnected || !credentials) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get all repositories that start with 'client-'
        const repos = await githubFetch('/user/repos?per_page=100');
        const clientRepos = repos.filter((repo: any) => repo.name.startsWith('client-'));

        // Convert repos to website format
        const websiteList = await Promise.all(clientRepos.map(async (repo: any) => {
          try {
            // Try to get website config file
            const configResponse = await githubFetch(`/repos/${credentials.username}/${repo.name}/contents/website.json`);
            const configContent = JSON.parse(Buffer.from(configResponse.content, 'base64').toString('utf-8'));

            return {
              id: repo.id.toString(),
              name: repo.name.replace('client-', ''),
              client: configContent.businessName || repo.name.replace('client-', ''),
              template: configContent.template || 'Unknown Template',
              status: 'published',
              description: repo.description || '',
              createdAt: new Date(repo.created_at).toLocaleDateString(),
              githubUrl: repo.html_url,
              preview: configContent.preview || '',
              content: configContent.content || {},
              styles: configContent.styles || {
                colors: {
                  primary: '#9b87f5',
                  secondary: '#7E69AB',
                  text: '#1A1F2C',
                  background: '#ffffff'
                }
              }
            };
          } catch (error) {
            // If no config file, create basic website object
            return {
              id: repo.id.toString(),
              name: repo.name.replace('client-', ''),
              client: repo.name.replace('client-', ''),
              template: 'Unknown Template',
              status: 'published',
              description: repo.description || '',
              createdAt: new Date(repo.created_at).toLocaleDateString(),
              githubUrl: repo.html_url,
              preview: '',
              content: {},
              styles: {
                colors: {
                  primary: '#9b87f5',
                  secondary: '#7E69AB',
                  text: '#1A1F2C',
                  background: '#ffffff'
                }
              }
            };
          }
        }));

        setWebsites(websiteList);
      } catch (error) {
        console.error('Failed to fetch websites:', error);
        toast.error('Failed to load websites from GitHub');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebsites();
  }, [isConnected, credentials]);

  const handleViewDetails = (website: Website) => {
    setSelectedWebsite(website);
    setIsDialogOpen(true);
  };

  const handleEditWebsite = (website: Website) => {
    setSelectedWebsite(website);
    setIsEditDialogOpen(true);
  };

  const handleSaveWebsite = async (updatedWebsite: Website) => {
    try {
      // Update website.json in GitHub
      await handlePushToGithub(updatedWebsite);
      setWebsites(websites.map(w => w.id === updatedWebsite.id ? updatedWebsite : w));
      toast.success('Website updated successfully');
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update website');
    }
  };

  const handlePushToGithub = async (website: Website) => {
    try {
      await pushToGithub([{
        path: 'website.json',
        content: JSON.stringify({
          businessName: website.client,
          template: website.template,
          preview: website.preview,
          content: website.content,
          styles: website.styles
        }, null, 2),
        message: 'Update website configuration'
      }], `client-${website.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
      toast.success('Website pushed to GitHub successfully');
    } catch (error) {
      toast.error('Failed to push website to GitHub');
      throw error;
    }
  };

  return (
    <div>
      <PageHeader 
        title="Generated Websites" 
        description="Manage your generated websites and publish them to GitHub"
        actionButton={{
          label: "Generate New",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate('/templates'),
        }}
      />

      <div className="flex items-center justify-between mb-6">
        <Button
          variant={isConnected ? "outline" : "default"}
          className={`${isConnected ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' : ''}`}
          onClick={() => setIsGitHubDialogOpen(true)}
        >
          <Github className="h-4 w-4 mr-2" />
          {isConnected ? 'Connected to GitHub' : 'Connect to GitHub'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : !isConnected ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Connect to GitHub to view your generated websites</p>
          <Button 
            onClick={() => setIsGitHubDialogOpen(true)}
            variant="outline"
          >
            <Github className="h-4 w-4 mr-2" />
            Connect to GitHub
          </Button>
        </div>
      ) : websites.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No websites generated yet</p>
          <Button 
            onClick={() => navigate('/templates')}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Your First Website
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Websites</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
          <WebsiteTabsContent
            tabValue="all"
            websites={websites}
            onViewDetails={handleViewDetails}
            onEditWebsite={handleEditWebsite}
            onPushToGithub={handlePushToGithub}
          />
          <WebsiteTabsContent
            tabValue="published"
            websites={websites}
            onViewDetails={handleViewDetails}
            onEditWebsite={handleEditWebsite}
            onPushToGithub={handlePushToGithub}
          />
          <WebsiteTabsContent
            tabValue="draft"
            websites={websites}
            onViewDetails={handleViewDetails}
            onEditWebsite={handleEditWebsite}
            onPushToGithub={handlePushToGithub}
          />
        </Tabs>
      )}

      {selectedWebsite && (
        <>
          <WebsiteDetails
            website={selectedWebsite}
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
          />
          <EditWebsiteDialog
            website={selectedWebsite}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={handleSaveWebsite}
          />
        </>
      )}

      <GitHubConnectionDialog
        isOpen={isGitHubDialogOpen}
        onClose={() => setIsGitHubDialogOpen(false)}
        onConnect={connectToGithub}
        onDisconnect={disconnectGithub}
        isConnecting={isConnecting}
        isConnected={isConnected}
        credentials={credentials}
      />
    </div>
  );
};

export default WebsitesPage;
