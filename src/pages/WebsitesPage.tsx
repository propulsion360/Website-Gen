
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import WebsiteList from '@/components/websites/WebsiteList';
import { Website } from '@/types/website';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';

// Mock data
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
  },
];

const WebsitesPage = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>(mockWebsites);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePushToGithub = (website: Website) => {
    // Simulate GitHub push
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Pushing to GitHub...',
        success: () => {
          // Fix: Explicitly use a valid literal type for status
          const updatedWebsites = websites.map(w => 
            w.id === website.id 
              ? { 
                  ...w, 
                  status: 'published' as const, // Explicitly cast to the literal type
                  githubUrl: `https://github.com/example/${w.name.toLowerCase().replace(/\s+/g, '-')}` 
                } 
              : w
          );
          setWebsites(updatedWebsites);
          return `${website.name} successfully pushed to GitHub`;
        },
        error: 'Failed to push to GitHub',
      }
    );
  };

  const handleViewDetails = (website: Website) => {
    setSelectedWebsite(website);
    setIsDialogOpen(true);
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

      <Tabs defaultValue="all" className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all">
          <WebsiteList 
            websites={websites} 
            onPushToGithub={handlePushToGithub}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
        
        <TabsContent value="draft">
          <WebsiteList 
            websites={websites.filter(w => w.status === 'draft')} 
            onPushToGithub={handlePushToGithub}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
        
        <TabsContent value="ready">
          <WebsiteList 
            websites={websites.filter(w => w.status === 'ready')} 
            onPushToGithub={handlePushToGithub}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
        
        <TabsContent value="published">
          <WebsiteList 
            websites={websites.filter(w => w.status === 'published')} 
            onPushToGithub={handlePushToGithub}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedWebsite && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedWebsite.name}</DialogTitle>
                <DialogDescription>
                  Website details and preview
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden mb-4">
                    {selectedWebsite.preview ? (
                      <img 
                        src={selectedWebsite.preview} 
                        alt={selectedWebsite.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No preview available</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Client</h4>
                    <p>{selectedWebsite.client}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Template</h4>
                    <p>{selectedWebsite.template}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <p className="capitalize">{selectedWebsite.status}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p>{selectedWebsite.description || 'No description provided'}</p>
                  </div>
                  
                  {selectedWebsite.githubUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">GitHub Repository</h4>
                      <a 
                        href={selectedWebsite.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedWebsite.githubUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebsitesPage;
