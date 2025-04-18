import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitHubRepo } from '@/types/github';
import { Client } from '@/types/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useGithubIntegration from '@/hooks/useGithubIntegration';
import TemplateCard from './TemplateCard';
import TemplatePlaceholderDialog from './TemplatePlaceholderDialog';
import { TemplateService } from '@/lib/services/templateService';

interface TemplateRepoListProps {
  templates: GitHubRepo[];
  isLoading: boolean;
  onRefresh: () => void;
  clients?: Client[];
}

const TemplateRepoList: React.FC<TemplateRepoListProps> = ({
  templates,
  isLoading,
  onRefresh,
  clients = []
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<GitHubRepo | null>(null);
  const [isPlaceholderDialogOpen, setIsPlaceholderDialogOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const { cloneTemplate, githubFetch } = useGithubIntegration();
  const [templatesWithPlaceholders, setTemplatesWithPlaceholders] = useState<GitHubRepo[]>([]);

  useEffect(() => {
    const scanTemplates = async () => {
      try {
        const scannedTemplates = await Promise.all(
          templates.map(async (template) => {
            const metadata = await TemplateService.getTemplateMetadata(template, githubFetch);
            return {
              ...template,
              placeholders: metadata.placeholders
            };
          })
        );
        setTemplatesWithPlaceholders(scannedTemplates);
      } catch (error) {
        console.error('Failed to scan templates:', error);
        toast.error('Failed to scan templates for placeholders');
      }
    };

    if (templates.length > 0) {
      scanTemplates();
    }
  }, [templates, githubFetch]);

  const handleUseTemplate = (template: GitHubRepo) => {
    setSelectedTemplate(template);
    setIsPlaceholderDialogOpen(true);
  };

  const handlePlaceholderSubmit = async (values: Record<string, string>) => {
    if (!selectedTemplate) return;

    setIsCloning(true);
    try {
      // Generate repo name from client business name or template name
      const businessName = values.businessName || selectedTemplate.name;
      const repoName = `client-${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      
      // Clone the template and replace placeholders
      await cloneTemplate(selectedTemplate, repoName, values);

      toast.success(`Successfully created website from template`);
      setIsPlaceholderDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error('Failed to create repository from template');
    } finally {
      setIsCloning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (templatesWithPlaceholders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No template repositories found</p>
            <Button variant="outline" onClick={onRefresh}>
              Refresh Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templatesWithPlaceholders.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUseTemplate={handleUseTemplate}
            isCloning={isCloning && selectedTemplate?.id === template.id}
          />
        ))}
      </div>

      {selectedTemplate && (
        <TemplatePlaceholderDialog
          isOpen={isPlaceholderDialogOpen}
          onClose={() => {
            setIsPlaceholderDialogOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onSubmit={handlePlaceholderSubmit}
          clients={clients}
          isLoading={isCloning}
        />
      )}
    </>
  );
};

export default TemplateRepoList;
