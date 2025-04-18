import { TemplatePlaceholder } from '@/types/template';

export class TemplateAnalysisService {
  private static PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}/g;

  static async analyzeTemplate(files: { path: string; content: string }[]): Promise<TemplatePlaceholder[]> {
    const placeholders = new Map<string, TemplatePlaceholder>();

    for (const file of files) {
      let match;
      while ((match = this.PLACEHOLDER_REGEX.exec(file.content)) !== null) {
        const name = match[1].trim();
        const existing = placeholders.get(name);
        
        if (existing) {
          existing.occurrences++;
          if (!existing.files.includes(file.path)) {
            existing.files.push(file.path);
          }
        } else {
          placeholders.set(name, {
            name,
            type: this.inferFieldType(name),
            description: this.generateDescription(name),
            required: this.inferRequired(name),
            occurrences: 1,
            files: [file.path],
            category: this.inferCategory(name),
            displayOrder: this.inferDisplayOrder(name)
          });
        }
      }
    }

    return Array.from(placeholders.values());
  }

  private static inferFieldType(name: string): TemplatePlaceholder['type'] {
    const lower = name.toLowerCase();
    if (lower.includes('email')) return 'email';
    if (lower.includes('phone')) return 'tel';
    if (lower.includes('color')) return 'color';
    if (lower.includes('date')) return 'date';
    if (lower.includes('description') || lower.includes('about')) return 'textarea';
    if (lower.includes('url') || lower.includes('website') || lower.includes('link')) return 'url';
    return 'text';
  }

  private static generateDescription(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .trim()
      .replace(/^./, str => str.toUpperCase());
  }

  private static inferRequired(name: string): boolean {
    const lower = name.toLowerCase();
    // Most business and contact information is typically required
    return lower.includes('name') || 
           lower.includes('email') || 
           lower.includes('phone') || 
           lower.includes('address');
  }

  private static inferCategory(name: string): TemplatePlaceholder['category'] {
    const lower = name.toLowerCase();
    if (lower.includes('color') || lower.includes('font') || lower.includes('theme')) return 'design';
    if (lower.includes('facebook') || lower.includes('instagram') || lower.includes('twitter')) return 'social';
    if (lower.includes('email') || lower.includes('phone') || lower.includes('address')) return 'contact';
    if (lower.includes('business') || lower.includes('company')) return 'business';
    return 'content';
  }

  private static inferDisplayOrder(name: string): number {
    const categoryOrder: Record<string, number> = {
      business: 1,
      contact: 2,
      content: 3,
      design: 4,
      social: 5
    };

    const category = this.inferCategory(name);
    return categoryOrder[category] * 100 + (name.length % 100);
  }
} 