
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import TemplateList from '@/components/templates/TemplateList';
import GitHubConnectButton from '@/components/buttons/GitHubConnectButton';
import { Template } from '@/types/template';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Business Portfolio',
    type: 'Corporate',
    description: 'A professional business portfolio template with multiple pages and sections.',
    branch: 'main',
    repoUrl: 'https://github.com/example/business-portfolio',
    lastUpdated: '2 days ago',
    preview: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'E-commerce Starter',
    type: 'Online Store',
    description: 'A complete e-commerce solution with product listings and checkout flow.',
    branch: 'main',
    repoUrl: 'https://github.com/example/ecommerce-starter',
    lastUpdated: '1 week ago',
    preview: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Personal Blog',
    type: 'Blog',
    description: 'A minimalist blog template for personal or professional use.',
    branch: 'main',
    repoUrl: 'https://github.com/example/personal-blog',
    lastUpdated: '3 days ago',
    preview: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
  },
];

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectGithub = async () => {
    // Simulate GitHub connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsGithubConnected(true);
    setTemplates(mockTemplates);
  };

  const handleRefreshTemplates = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to refresh templates
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Templates refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh templates:', error);
      toast.error('Failed to refresh templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWebsite = (template: Template) => {
    navigate(`/generate/${template.id}`);
  };

  return (
    <div>
      <PageHeader 
        title="Website Templates" 
        description="Connect to GitHub and manage your website templates"
        actionButton={
          isGithubConnected ? {
            label: "Refresh Templates",
            icon: <RefreshCw className="h-4 w-4" />,
            onClick: handleRefreshTemplates,
          } : undefined
        }
      />

      <Tabs defaultValue="templates" className="mt-6">
        <TabsList>
          <TabsTrigger value="templates">All Templates</TabsTrigger>
          <TabsTrigger value="github">GitHub Connection</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-4">
          {isGithubConnected ? (
            <TemplateList 
              templates={templates} 
              onGenerateWebsite={handleGenerateWebsite} 
            />
          ) : (
            <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Connect to GitHub to import your templates</p>
              <Button 
                onClick={() => navigate('/templates?tab=github')}
                variant="outline"
              >
                Connect Now
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="github" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Connect your GitHub account to import templates and push generated websites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Connecting to GitHub allows you to import your website templates directly and 
                  push the generated websites to new repositories.
                </p>
                <GitHubConnectButton 
                  onConnect={handleConnectGithub}
                  isConnected={isGithubConnected}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplatesPage;
