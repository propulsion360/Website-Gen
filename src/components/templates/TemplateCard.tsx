import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileCode, GitBranch, Eye, Settings } from 'lucide-react';
import { Template } from '@/types/template';
import { Badge } from '@/components/ui/badge';
import { PreviewModal } from '@/components/ui/PreviewModal';
import { PreviewButton } from '@/components/ui/PreviewButton';
import { format } from 'date-fns';

interface TemplateCardProps {
  template: Template;
  onGenerateWebsite: (template: Template) => void;
  onSelect: (template: Template) => void;
}

const TemplateCard = ({ template, onGenerateWebsite, onSelect }: TemplateCardProps) => {
  const previewUrl = `https://${template.id.replace('template-', '')}.template.propulsion360.com`;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{template.name}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              {template.category}
            </Badge>
          </div>
          <PreviewButton url={previewUrl} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-gray-500">{template.description}</p>
        {template.previewImage && (
          <div className="mt-4 relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={template.previewImage}
              alt={template.name}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div className="mt-4 text-xs text-gray-500">
          Last updated: {format(template.lastUpdated, 'PPP')}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center gap-2">
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
          onClick={() => onSelect(template)}
        >
          <Settings className="h-4 w-4" />
          Configure
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
