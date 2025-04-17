
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileCode, GitBranch } from 'lucide-react';
import { Template } from '@/types/template';

interface TemplateCardProps {
  template: Template;
  onGenerateWebsite: (template: Template) => void;
}

const TemplateCard = ({ template, onGenerateWebsite }: TemplateCardProps) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
            <CardDescription className="text-sm text-gray-500">{template.type}</CardDescription>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <GitBranch className="h-3.5 w-3.5 mr-1" />
            <span>{template.branch}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="h-32 rounded bg-gray-100 mb-4 overflow-hidden">
          {template.preview ? (
            <img 
              src={template.preview} 
              alt={template.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <FileCode className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          <span>Last updated {template.lastUpdated}</span>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center p-2" 
            onClick={() => window.open(template.repoUrl, '_blank')}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="text-xs bg-dashboard-purple hover:bg-purple-700"
            onClick={() => onGenerateWebsite(template)}
          >
            Generate Website
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
