import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Github, Rocket, Database, RefreshCw, Save, LogOut } from 'lucide-react';
import GitHubConnectionDialog from '@/components/github/GitHubConnectionDialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import PageHeader from '@/components/layout/PageHeader';
import useGithubIntegration from '@/hooks/useGithubIntegration';

interface IntegrationConfig {
  vercelToken: string;
  vercelTeamId: string;
  strapiUrl: string;
  strapiToken: string;
  enableStrapi: boolean;
}

const SettingsPage = () => {
  const [isGithubDialogOpen, setIsGithubDialogOpen] = useState(false);
  const { 
    isConnected, 
    credentials, 
    disconnectGithub,
    connectToGithub,
    isConnecting,
    refreshTemplates
  } = useGithubIntegration();
  const [config, setConfig] = useLocalStorage<IntegrationConfig>('integration_config', {
    vercelToken: import.meta.env.VITE_VERCEL_TOKEN || '',
    vercelTeamId: import.meta.env.VITE_VERCEL_TEAM_ID || '',
    strapiUrl: '',
    strapiToken: '',
    enableStrapi: false,
  });

  useEffect(() => {
    // Load environment variables into config if not already set
    if (!config.vercelToken && import.meta.env.VITE_VERCEL_TOKEN) {
      setConfig(prev => ({
        ...prev,
        vercelToken: import.meta.env.VITE_VERCEL_TOKEN || '',
        vercelTeamId: import.meta.env.VITE_VERCEL_TEAM_ID || '',
      }));
    }
  }, []);

  const handleSaveIntegrations = () => {
    setConfig(config);
    toast.success('Integration settings saved successfully');
  };

  const handleGithubConnect = async (credentials: { accessToken: string; username: string }) => {
    const success = await connectToGithub(credentials.accessToken, credentials.username);
    if (success) {
      setIsGithubDialogOpen(false);
      await refreshTemplates();
    }
    return success;
  };

  const handleGithubDisconnect = () => {
    disconnectGithub();
    toast.success('Disconnected from GitHub');
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="Settings" 
        description="Manage your integrations and configurations"
      />

      <Tabs defaultValue="integrations" className="mt-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {/* GitHub Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Github className="mr-2 h-5 w-5" />
                GitHub Integration
              </CardTitle>
              <CardDescription>
                Connect to GitHub to manage templates and client websites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Connection Status</p>
                    <p className="text-sm text-gray-500">
                      {isConnected && credentials ? 'Connected as ' + credentials.username : 'Not connected'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isConnected ? (
                      <Button
                        variant="destructive"
                        onClick={handleGithubDisconnect}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setIsGithubDialogOpen(true)}
                      >
                        <Github className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vercel Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rocket className="mr-2 h-5 w-5" />
                Vercel Integration
              </CardTitle>
              <CardDescription>
                Configure Vercel deployment settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vercelToken">Vercel Access Token</Label>
                  <Input
                    id="vercelToken"
                    type="password"
                    value={config.vercelToken}
                    onChange={(e) => setConfig({ ...config, vercelToken: e.target.value })}
                    placeholder="Enter your Vercel access token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vercelTeamId">Team ID</Label>
                  <Input
                    id="vercelTeamId"
                    value={config.vercelTeamId}
                    onChange={(e) => setConfig({ ...config, vercelTeamId: e.target.value })}
                    placeholder="Enter your Vercel team ID"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strapi Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Strapi CMS Integration
              </CardTitle>
              <CardDescription>
                Configure Strapi CMS connection for content management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-strapi"
                    checked={config.enableStrapi}
                    onCheckedChange={(checked) => setConfig({ ...config, enableStrapi: checked })}
                  />
                  <Label htmlFor="enable-strapi">Enable Strapi Integration</Label>
                </div>

                {config.enableStrapi && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="strapiUrl">Strapi URL</Label>
                      <Input
                        id="strapiUrl"
                        value={config.strapiUrl}
                        onChange={(e) => setConfig({ ...config, strapiUrl: e.target.value })}
                        placeholder="Enter your Strapi API URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="strapiToken">API Token</Label>
                      <Input
                        id="strapiToken"
                        type="password"
                        value={config.strapiToken}
                        onChange={(e) => setConfig({ ...config, strapiToken: e.target.value })}
                        placeholder="Enter your Strapi API token"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setConfig(config)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSaveIntegrations}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">General settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <GitHubConnectionDialog
        isOpen={isGithubDialogOpen}
        onClose={() => setIsGithubDialogOpen(false)}
        onConnect={handleGithubConnect}
        onDisconnect={handleGithubDisconnect}
        isConnecting={isConnecting}
        isConnected={isConnected}
        credentials={credentials}
      />
    </div>
  );
};

export default SettingsPage; 