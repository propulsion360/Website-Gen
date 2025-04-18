import React from 'react';
import { motion } from 'framer-motion';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TemplatePlaceholder } from '@/types/template';
import { FormField } from './FormField';
import { FormProgress } from './FormProgress';
import { Button } from '@/components/ui/button';

interface DynamicFormProps {
  templateName: string;
  placeholders: TemplatePlaceholder[];
  onSubmit: (data: any) => Promise<void>;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  templateName,
  placeholders,
  onSubmit,
}) => {
  // Group placeholders by category
  const groupedPlaceholders = React.useMemo(() => {
    return placeholders.reduce((acc, placeholder) => {
      const category = placeholder.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(placeholder);
      return acc;
    }, {} as Record<string, TemplatePlaceholder[]>);
  }, [placeholders]);

  // Generate validation schema
  const validationSchema = React.useMemo(() => {
    const schema: Record<string, any> = {};
    
    placeholders.forEach((placeholder) => {
      let fieldSchema = z.string();
      
      if (placeholder.required) {
        fieldSchema = fieldSchema.min(1, 'This field is required');
      }

      if (placeholder.validation?.pattern) {
        fieldSchema = fieldSchema.regex(new RegExp(placeholder.validation.pattern));
      }

      if (placeholder.type === 'email') {
        fieldSchema = fieldSchema.email('Invalid email address');
      }

      if (placeholder.type === 'tel') {
        fieldSchema = fieldSchema.regex(/^\+?[\d\s-()]+$/, 'Invalid phone number');
      }

      if (placeholder.type === 'url') {
        fieldSchema = fieldSchema.url('Invalid URL');
      }

      schema[placeholder.name] = placeholder.required ? fieldSchema : fieldSchema.optional();
    });

    return z.object(schema);
  }, [placeholders]);

  const methods = useForm({
    resolver: zodResolver(validationSchema),
  });

  const [currentSection, setCurrentSection] = React.useState(0);
  const sections = Object.keys(groupedPlaceholders);

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto py-8 px-4"
      >
        <h1 className="text-3xl font-bold text-center mb-8">
          {templateName}
        </h1>

        <FormProgress
          sections={sections}
          currentSection={currentSection}
          onSectionClick={setCurrentSection}
        />

        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: currentSection === index ? 1 : 0,
                x: currentSection === index ? 0 : 20
              }}
              transition={{ duration: 0.3 }}
              className={`space-y-6 ${currentSection !== index ? 'hidden' : ''}`}
            >
              <h2 className="text-xl font-semibold capitalize">
                {section}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedPlaceholders[section].map((placeholder) => (
                  <FormField
                    key={placeholder.name}
                    placeholder={placeholder}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            
            {currentSection === sections.length - 1 ? (
              <Button
                type="submit"
                disabled={methods.formState.isSubmitting}
              >
                {methods.formState.isSubmitting ? 'Generating...' : 'Generate Website'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setCurrentSection(currentSection + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </FormProvider>
  );
}; 