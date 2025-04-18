import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitHubRepo } from '@/types/github';
import { TemplatePlaceholder } from '@/lib/services/templateService';
import { GitBranch, Star, FileText, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { PreviewModal } from '@/components/ui/PreviewModal';
import { PreviewButton } from '@/components/ui/PreviewButton';

interface TemplateCardProps {
  template: GitHubRepo & {
    placeholders?: TemplatePlaceholder[];
  };
  onUseTemplate: (template: GitHubRepo) => void;
  isCloning?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUseTemplate,
  isCloning = false
}) => {
  const placeholderCount = template.placeholders?.length || 0;
  const previewUrl = `https://${template.name.replace('template-', '')}.template.propulsion360.com`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center">
            <span className="truncate">{template.name}</span>
          </CardTitle>
          <PreviewButton url={previewUrl} size="sm" />
        </div>
        <div className="flex items-center space-x-2 text-gray-500 mt-2">
          <GitBranch className="h-4 w-4" />
          <span className="text-sm">{template.default_branch}</span>
          <Star className="h-4 w-4 ml-2" />
          <span className="text-sm">{template.stars}</span>
        </div>
        <CardDescription className="line-clamp-2 mt-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {placeholderCount > 0 && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary">
                      {placeholderCount} placeholder{placeholderCount !== 1 ? 's' : ''}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">Template Placeholders:</p>
                      <ul className="text-sm list-disc list-inside">
                        {template.placeholders?.map(p => (
                          <li key={p.name} className="text-xs">
                            {p.name} ({p.occurrences} {p.occurrences === 1 ? 'occurrence' : 'occurrences'})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          <div className="flex justify-between items-center gap-2">
            <PreviewModal
              url={previewUrl}
              title={template.name}
              trigger={
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              }
            />
            <Button
              variant="default"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => onUseTemplate(template)}
              disabled={isCloning}
            >
              {isCloning ? (
                <>
                  <FileText className="mr-2 h-4 w-4 animate-spin" />
                  Cloning...
                </>
              ) : (
                'Use Template'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard; 