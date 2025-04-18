import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DynamicForm } from '@/components/DynamicForm';
import { WebsiteGenerationService } from '@/lib/services/websiteGenerationService';
import { GeneratedForm, Template } from '@/types/template';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FormPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<GeneratedForm | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (!response.ok) {
          throw new Error('Form not found');
        }

        const data = await response.json();
        setForm(data.form);
        setTemplate(data.template);
      } catch (error) {
        toast.error('Failed to load form');
        navigate('/error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [formId, navigate]);

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Get integration config from localStorage
      const integrationConfig = JSON.parse(localStorage.getItem('integration_config') || '{}');
      const githubCredentials = JSON.parse(localStorage.getItem('github_credentials') || '{}');

      if (!githubCredentials?.accessToken || !integrationConfig?.vercelToken || !integrationConfig?.vercelTeamId) {
        toast.error('Missing GitHub or Vercel credentials. Please check your settings.');
        return;
      }

      // 1. Generate website
      const websiteService = new WebsiteGenerationService(
        githubCredentials.accessToken,
        githubCredentials.username,
        integrationConfig.vercelToken,
        integrationConfig.vercelTeamId,
        integrationConfig.enableStrapi ? integrationConfig.strapiWebhookUrl : undefined
      );

      const result = await websiteService.generateWebsite(
        template!,
        {
          businessName: data.businessName,
          contactName: data.contactName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          colors: {
            primary: data.primaryColor || '#000000',
            secondary: data.secondaryColor || '#ffffff',
            accent: data.accentColor || '#cccccc'
          }
        },
        integrationConfig.enableStrapi
      );

      // 2. Save submission with the correct deployment URL
      await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          data,
          websiteUrl: result.deploymentUrl
        })
      });

      // 3. Send to GoHighLevel with the correct URL
      await fetch('/api/webhook/gohighlevel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: data,
          websiteUrl: result.deploymentUrl
        })
      });

      // 4. Navigate to success page with the correct URL
      navigate(`/form/success?url=${encodeURIComponent(result.deploymentUrl)}`);
    } catch (error) {
      console.error('Form submission failed:', error);
      toast.error('Failed to generate website. Please check your settings and try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Form Not Found</h1>
          <p className="mt-4">This form may have expired or does not exist.</p>
        </div>
      </div>
    );
  }

  if (form.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Form Expired</h1>
          <p className="mt-4">This form has expired. Please request a new form link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicForm
        templateName={template.name}
        placeholders={form.placeholders}
        onSubmit={handleSubmit}
      />
    </div>
  );
} 