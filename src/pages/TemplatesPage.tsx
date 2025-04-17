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
import TemplateRepoList from '@/components/github/TemplateRepoList';
import useGithubIntegration from '@/hooks/useGithubIntegration';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { 
    isConnected,
    templates: githubTemplates,
    isLoadingTemplates,
    refreshTemplates
  } = useGithubIntegration();

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
          {isConnected ? (
            <div className="space-y-6">
              <TemplateRepoList 
                templates={githubTemplates}
                isLoading={isLoadingTemplates}
                onRefresh={refreshTemplates}
              />
              <TemplateList 
                templates={templates} 
                onGenerateWebsite={handleGenerateWebsite} 
              />
            </div>
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
