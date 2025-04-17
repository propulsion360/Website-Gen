
import React from 'react';
import TemplateCard from './TemplateCard';
import { Template } from '@/types/template';

interface TemplateListProps {
  templates: Template[];
  onGenerateWebsite: (template: Template) => void;
}

const TemplateList = ({ templates, onGenerateWebsite }: TemplateListProps) => {
  if (!templates || templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">No templates found</p>
        <p className="text-sm text-gray-400">Connect to GitHub to import templates</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard 
          key={template.id} 
          template={template} 
          onGenerateWebsite={onGenerateWebsite} 
        />
      ))}
    </div>
  );
};

export default TemplateList;
