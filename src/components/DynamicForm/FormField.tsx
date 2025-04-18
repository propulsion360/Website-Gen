import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TemplatePlaceholder } from '@/types/template';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormFieldProps {
  placeholder: TemplatePlaceholder;
}

export const FormField: React.FC<FormFieldProps> = ({ placeholder }) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[placeholder.name];

  const renderField = () => {
    switch (placeholder.type) {
      case 'textarea':
        return (
          <Textarea
            {...register(placeholder.name)}
            placeholder={`Enter ${placeholder.description.toLowerCase()}`}
            className="min-h-[100px]"
          />
        );
      
      case 'select':
        return (
          <Select onValueChange={(value) => register(placeholder.name).onChange({ target: { value } })}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${placeholder.description.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {placeholder.validation?.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <Input
              {...register(placeholder.name)}
              type="color"
              className="w-12 h-12 p-1"
            />
            <Input
              {...register(placeholder.name)}
              type="text"
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        );
      
      default:
        return (
          <Input
            {...register(placeholder.name)}
            type={placeholder.type}
            placeholder={`Enter ${placeholder.description.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor={placeholder.name}>
          {placeholder.description}
          {placeholder.required && <span className="text-red-500">*</span>}
        </Label>
        {placeholder.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{placeholder.description}</p>
                {placeholder.validation && (
                  <ul className="text-xs mt-1">
                    {placeholder.validation.min && (
                      <li>Minimum length: {placeholder.validation.min}</li>
                    )}
                    {placeholder.validation.max && (
                      <li>Maximum length: {placeholder.validation.max}</li>
                    )}
                  </ul>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {renderField()}
      {error && (
        <p className="text-sm text-red-500">
          {error.message as string}
        </p>
      )}
    </div>
  );
}; 