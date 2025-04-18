import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GitHubRepo } from '@/types/github';
import { TemplatePlaceholder } from '@/lib/services/templateService';
import { Client } from '@/types/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TemplatePlaceholderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: GitHubRepo & { placeholders?: TemplatePlaceholder[] };
  onSubmit: (values: Record<string, string>) => void;
  clients?: Client[];
  isLoading?: boolean;
}

const TemplatePlaceholderDialog: React.FC<TemplatePlaceholderDialogProps> = ({
  isOpen,
  onClose,
  template,
  onSubmit,
  clients = [],
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'client'>('manual');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [values, setValues] = useState<Record<string, string>>({});

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    setSelectedClient(clientId);
    
    // Map client data to placeholder values
    const clientValues: Record<string, string> = {};
    template.placeholders?.forEach(placeholder => {
      const name = placeholder.name.toLowerCase();
      if (name.includes('business')) clientValues[placeholder.name] = client.businessName;
      else if (name.includes('contact')) clientValues[placeholder.name] = client.contactName;
      else if (name.includes('email')) clientValues[placeholder.name] = client.email;
      else if (name.includes('phone')) clientValues[placeholder.name] = client.phone;
      else if (name.includes('address')) clientValues[placeholder.name] = client.address || '';
      else if (name.includes('primary') && name.includes('color')) clientValues[placeholder.name] = client.colors?.primary || '#000000';
      else if (name.includes('secondary') && name.includes('color')) clientValues[placeholder.name] = client.colors?.secondary || '#ffffff';
      else if (name.includes('accent') && name.includes('color')) clientValues[placeholder.name] = client.colors?.accent || '#cccccc';
    });

    setValues(clientValues);
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  const renderField = (placeholder: TemplatePlaceholder) => {
    switch (placeholder.type) {
      case 'textarea':
        return (
          <Textarea
            id={placeholder.name}
            value={values[placeholder.name] || ''}
            onChange={(e) => setValues({ ...values, [placeholder.name]: e.target.value })}
            placeholder={`Enter ${placeholder.name.toLowerCase()}`}
          />
        );
      case 'color':
        return (
          <Input
            type="color"
            id={placeholder.name}
            value={values[placeholder.name] || '#000000'}
            onChange={(e) => setValues({ ...values, [placeholder.name]: e.target.value })}
            className="h-10 px-2 w-full"
          />
        );
      default:
        return (
          <Input
            type={placeholder.type || 'text'}
            id={placeholder.name}
            value={values[placeholder.name] || ''}
            onChange={(e) => setValues({ ...values, [placeholder.name]: e.target.value })}
            placeholder={`Enter ${placeholder.name.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Template</DialogTitle>
          <DialogDescription>
            Fill in the values for the template placeholders
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manual' | 'client')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="client" disabled={clients.length === 0}>
              Select Client
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            {template.placeholders?.map((placeholder) => (
              <div key={placeholder.name} className="space-y-2">
                <Label htmlFor={placeholder.name}>
                  {placeholder.name}
                  {placeholder.required && <span className="text-red-500">*</span>}
                </Label>
                {renderField(placeholder)}
                {placeholder.description && (
                  <p className="text-xs text-gray-500">{placeholder.description}</p>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="client" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="client">Select Client</Label>
              <Select
                value={selectedClient}
                onValueChange={handleClientSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClient && (
              <div className="space-y-4 mt-4">
                {template.placeholders?.map((placeholder) => (
                  <div key={placeholder.name} className="space-y-2">
                    <Label htmlFor={placeholder.name}>
                      {placeholder.name}
                      {placeholder.required && <span className="text-red-500">*</span>}
                    </Label>
                    {renderField(placeholder)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (template.placeholders?.some(p => p.required && !values[p.name]) ?? false)}
          >
            {isLoading ? 'Generating...' : 'Generate Website'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePlaceholderDialog; 