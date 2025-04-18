import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import TemplateRepoList from '@/components/github/TemplateRepoList';
import useGithubIntegration from '@/hooks/useGithubIntegration';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/client';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const { 
    isConnected,
    templates,
    isLoadingTemplates,
    refreshTemplates
  } = useGithubIntegration();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  // Automatically fetch templates when component mounts
  useEffect(() => {
    if (isConnected) {
      refreshTemplates();
      fetchClients();
    }
  }, [isConnected]);

  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleRefresh = async () => {
    if (!isConnected) {
      toast.error('Please connect to GitHub in Settings first');
      return;
    }
    await refreshTemplates();
    await fetchClients();
  };

  return (
    <div>
      <PageHeader 
        title="Website Templates" 
        description="Browse and use website templates from your GitHub repositories"
        actionButton={{
          label: "Refresh Templates",
          icon: <RefreshCw className="h-4 w-4" />,
          onClick: handleRefresh,
          disabled: isLoadingTemplates || isLoadingClients
        }}
      />

      {isConnected ? (
        <div className="mt-6">
          <TemplateRepoList 
            templates={templates}
            isLoading={isLoadingTemplates || isLoadingClients}
            onRefresh={refreshTemplates}
            clients={clients}
          />
        </div>
      ) : (
        <div className="mt-6 text-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Connect to GitHub to view your templates</p>
          <Button 
            onClick={() => navigate('/settings')}
            variant="outline"
          >
            Go to Settings
          </Button>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
