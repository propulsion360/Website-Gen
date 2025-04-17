
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Github } from 'lucide-react';
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

// Mock data with content and styles
const mockWebsites: Website[] = [
  {
    id: '1',
    name: 'Acme Inc. Website',
    client: 'Acme Corporation',
    template: 'Business Portfolio',
    status: 'ready',
    description: 'Corporate website with about, services, and contact pages',
    createdAt: '2 days ago',
    preview: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80',
    content: {
      sections: [
        {
          id: 'hero-title',
          type: 'text',
          label: 'Hero Title',
          content: 'Welcome to Acme Inc.'
        },
        {
          id: 'hero-image',
          type: 'image',
          label: 'Hero Image',
          content: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    styles: {
      colors: {
        primary: '#9b87f5',
        secondary: '#7E69AB',
        text: '#1A1F2C',
        background: '#ffffff'
      }
    }
  },
  {
    id: '2',
    name: 'TechStore',
    client: 'Digital Solutions Ltd',
    template: 'E-commerce Starter',
    status: 'published',
    description: 'Online store for tech products with shopping cart',
    createdAt: '1 week ago',
    githubUrl: 'https://github.com/example/techstore',
    preview: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=800&q=80',
    content: {
      sections: [
        {
          id: 'hero-title',
          type: 'text',
          label: 'Hero Title',
          content: 'Welcome to TechStore'
        },
        {
          id: 'hero-image',
          type: 'image',
          label: 'Hero Image',
          content: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    styles: {
      colors: {
        primary: '#9b87f5',
        secondary: '#7E69AB',
        text: '#1A1F2C',
        background: '#ffffff'
      }
    }
  },
  {
    id: '3',
    name: 'John Smith Blog',
    client: 'John Smith',
    template: 'Personal Blog',
    status: 'draft',
    description: 'Personal blog for sharing articles and photography',
    createdAt: '3 days ago',
    preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    content: {
      sections: [
        {
          id: 'hero-title',
          type: 'text',
          label: 'Hero Title',
          content: 'Welcome to John Smith Blog'
        },
        {
          id: 'hero-image',
          type: 'image',
          label: 'Hero Image',
          content: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    styles: {
      colors: {
        primary: '#9b87f5',
        secondary: '#7E69AB',
        text: '#1A1F2C',
        background: '#ffffff'
      }
    }
  },
];

const WebsitesPage = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>(mockWebsites);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGitHubDialogOpen, setIsGitHubDialogOpen] = useState(false);
  
  const { 
    isConnecting, 
    isConnected, 
    connectToGithub, 
    disconnectGithub,
    pushToGithub, 
    getRepositoryUrl,
    credentials 
  } = useGithubIntegration();

  const handlePushToGithub = async (website: Website) => {
    if (!isConnected) {
      toast.error('Please connect to GitHub first');
      setIsGitHubDialogOpen(true);
      return;
    }
    
    const success = await pushToGithub(website);
    
    if (success) {
      const updatedWebsites = websites.map(w => 
        w.id === website.id 
          ? { 
              ...w, 
              status: 'published' as const,
              githubUrl: getRepositoryUrl(w.name)
            } 
          : w
      );
      setWebsites(updatedWebsites);
    }
  };

  const handleViewDetails = (website: Website) => {
    setSelectedWebsite(website);
    setIsDialogOpen(true);
  };

  const handleEditWebsite = (website: Website) => {
    setSelectedWebsite(website);
    setIsEditDialogOpen(true);
  };

  const handleSaveWebsite = (updatedWebsite: Website) => {
    setWebsites(websites.map(w => w.id === updatedWebsite.id ? updatedWebsite : w));
    toast.success('Website updated successfully');
    setIsEditDialogOpen(false);
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

      <Tabs defaultValue="all" className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </div>
        
        <WebsiteTabsContent 
          tabValue="all"
          websites={websites}
          onPushToGithub={handlePushToGithub}
          onViewDetails={handleViewDetails}
          onEditWebsite={handleEditWebsite}
        />
        
        <WebsiteTabsContent 
          tabValue="draft"
          websites={websites}
          filteredWebsites={websites.filter(w => w.status === 'draft')}
          onPushToGithub={handlePushToGithub}
          onViewDetails={handleViewDetails}
          onEditWebsite={handleEditWebsite}
        />
        
        <WebsiteTabsContent 
          tabValue="ready"
          websites={websites}
          filteredWebsites={websites.filter(w => w.status === 'ready')}
          onPushToGithub={handlePushToGithub}
          onViewDetails={handleViewDetails}
          onEditWebsite={handleEditWebsite}
        />
        
        <WebsiteTabsContent 
          tabValue="published"
          websites={websites}
          filteredWebsites={websites.filter(w => w.status === 'published')}
          onPushToGithub={handlePushToGithub}
          onViewDetails={handleViewDetails}
          onEditWebsite={handleEditWebsite}
        />
      </Tabs>

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
