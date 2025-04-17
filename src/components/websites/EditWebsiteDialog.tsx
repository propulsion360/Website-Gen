
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Website } from '@/types/website';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditWebsiteDialogProps {
  website: Website;
  isOpen: boolean;
  onClose: () => void;
  onSave: (website: Website) => void;
}

const EditWebsiteDialog = ({ website, isOpen, onClose, onSave }: EditWebsiteDialogProps) => {
  const [editedWebsite, setEditedWebsite] = React.useState<Website>(website);

  const handleContentChange = (sectionId: string, value: string) => {
    setEditedWebsite(prev => ({
      ...prev,
      content: {
        sections: (prev.content?.sections || []).map(section =>
          section.id === sectionId ? { ...section, content: value } : section
        ),
      },
    }));
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setEditedWebsite(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        colors: {
          ...(prev.styles?.colors || {}),
          [colorKey]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    onSave(editedWebsite);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Website: {website.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="mt-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="styles">Styles</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            {editedWebsite.content?.sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <Label>{section.label}</Label>
                {section.type === 'text' ? (
                  <Input
                    value={section.content}
                    onChange={(e) => handleContentChange(section.id, e.target.value)}
                  />
                ) : (
                  <div className="space-y-2">
                    <img
                      src={section.content}
                      alt={section.label}
                      className="max-w-xs rounded-md"
                    />
                    <Input
                      type="url"
                      value={section.content}
                      onChange={(e) => handleContentChange(section.id, e.target.value)}
                      placeholder="Image URL"
                    />
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="styles" className="space-y-4">
            {Object.entries(editedWebsite.styles?.colors || {}).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label className="capitalize">{key} Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                  />
                  <Input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-20"
                  />
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditWebsiteDialog;
