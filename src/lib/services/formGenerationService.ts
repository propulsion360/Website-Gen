import { nanoid } from 'nanoid';
import { TemplatePlaceholder, GeneratedForm } from '@/types/template';

export class FormGenerationService {
  constructor(
    private readonly baseUrl: string,
    private readonly expirationDays: number = 7
  ) {}

  generateForm(templateId: string, placeholders: TemplatePlaceholder[]): GeneratedForm {
    const formId = nanoid();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.expirationDays);

    // Sort placeholders by category and display order
    const sortedPlaceholders = [...placeholders].sort((a, b) => {
      if (a.displayOrder && b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return 0;
    });

    return {
      id: formId,
      templateId,
      url: `${this.baseUrl}/form/${formId}`,
      expiresAt,
      placeholders: sortedPlaceholders,
      status: 'active',
      createdAt: new Date()
    };
  }

  validateFormData(data: Record<string, any>, placeholders: TemplatePlaceholder[]): string[] {
    const errors: string[] = [];

    for (const placeholder of placeholders) {
      const value = data[placeholder.name];

      if (placeholder.required && !value) {
        errors.push(`${placeholder.description} is required`);
        continue;
      }

      if (!value) continue;

      switch (placeholder.type) {
        case 'email':
          if (!this.isValidEmail(value)) {
            errors.push(`${placeholder.description} must be a valid email address`);
          }
          break;

        case 'tel':
          if (!this.isValidPhone(value)) {
            errors.push(`${placeholder.description} must be a valid phone number`);
          }
          break;

        case 'url':
          if (!this.isValidUrl(value)) {
            errors.push(`${placeholder.description} must be a valid URL`);
          }
          break;

        case 'color':
          if (!this.isValidColor(value)) {
            errors.push(`${placeholder.description} must be a valid color code`);
          }
          break;
      }

      if (placeholder.validation) {
        if (placeholder.validation.pattern) {
          const regex = new RegExp(placeholder.validation.pattern);
          if (!regex.test(value)) {
            errors.push(`${placeholder.description} has an invalid format`);
          }
        }

        if (typeof value === 'string') {
          if (placeholder.validation.min && value.length < placeholder.validation.min) {
            errors.push(`${placeholder.description} must be at least ${placeholder.validation.min} characters`);
          }
          if (placeholder.validation.max && value.length > placeholder.validation.max) {
            errors.push(`${placeholder.description} must be at most ${placeholder.validation.max} characters`);
          }
        }
      }
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^\+?[\d\s-()]+$/.test(phone);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }
} 