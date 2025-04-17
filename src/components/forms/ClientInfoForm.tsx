
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Template } from '@/types/template';

const formSchema = z.object({
  clientName: z.string().min(2, { message: 'Client name must be at least 2 characters' }),
  clientEmail: z.string().email({ message: 'Please enter a valid email address' }),
  clientPhone: z.string().min(7, { message: 'Please enter a valid phone number' }),
  clientAddress: z.string().min(5, { message: 'Address must be at least 5 characters' }),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Please enter a valid hex color code' }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Please enter a valid hex color code' }),
  websiteName: z.string().min(2, { message: 'Website name must be at least 2 characters' }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientInfoFormProps {
  onSubmit: (values: FormValues) => void;
  template: Template;
  isLoading?: boolean;
}

const ClientInfoForm = ({ onSubmit, template, isLoading = false }: ClientInfoFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      websiteName: '',
      description: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="font-medium mb-2">Template information</h3>
          <p className="text-sm text-gray-600 mb-2">
            You are generating a website based on: <span className="font-semibold">{template.name}</span>
          </p>
          <p className="text-sm text-gray-600">
            Template type: <span className="text-dashboard-blue">{template.type}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="websiteName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Website" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="clientEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Email</FormLabel>
                <FormControl>
                  <Input placeholder="contact@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="clientAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Business St, City, State" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Color</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input type="text" placeholder="#6366f1" {...field} />
                  </FormControl>
                  <div 
                    className="w-10 h-10 rounded border" 
                    style={{ backgroundColor: field.value }}
                  />
                </div>
                <FormDescription>Enter a hex color code (e.g. #6366f1)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Color</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input type="text" placeholder="#8b5cf6" {...field} />
                  </FormControl>
                  <div 
                    className="w-10 h-10 rounded border" 
                    style={{ backgroundColor: field.value }}
                  />
                </div>
                <FormDescription>Enter a hex color code (e.g. #8b5cf6)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of the website"
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-dashboard-blue hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Generating Website...' : 'Generate Website'}
        </Button>
      </form>
    </Form>
  );
};

export default ClientInfoForm;
