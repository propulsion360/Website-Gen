
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ClientInfoForm from '@/components/forms/ClientInfoForm';
import { Separator } from '@/components/ui/separator';
import { Template } from '@/types/template';
import { toast } from 'sonner';

// Mock data - in a real app, you'd fetch this from an API
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

const GenerateWebsitePage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Simulate fetching the template data
    setIsLoading(true);
    setTimeout(() => {
      const found = mockTemplates.find(t => t.id === templateId);
      if (found) {
        setTemplate(found);
      } else {
        toast.error('Template not found');
        navigate('/templates');
      }
      setIsLoading(false);
    }, 500);
  }, [templateId, navigate]);

  const handleSubmit = (values: any) => {
    setIsGenerating(true);
    // Simulate website generation
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: 'Generating website...',
        success: () => {
          setIsGenerating(false);
          navigate('/websites');
          return 'Website generated successfully!';
        },
        error: 'Failed to generate website',
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-dashboard-blue" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-10">
        <p>Template not found</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="p-0 mb-4" 
          onClick={() => navigate('/templates')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Generate Website</h1>
        <p className="text-muted-foreground mt-1">
          Fill in client information to generate a website from the {template.name} template
        </p>
        <Separator className="mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <ClientInfoForm 
                template={template} 
                onSubmit={handleSubmit}
                isLoading={isGenerating}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Template Preview</h3>
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden mb-4">
                {template.preview ? (
                  <img 
                    src={template.preview} 
                    alt={template.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No preview available</span>
                  </div>
                )}
              </div>
              <h4 className="font-medium mt-4 mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <div className="text-sm text-gray-500">
                <p><span className="font-medium">Type:</span> {template.type}</p>
                <p><span className="font-medium">Last Updated:</span> {template.lastUpdated}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GenerateWebsitePage;
