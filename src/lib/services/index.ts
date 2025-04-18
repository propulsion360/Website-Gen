import { AuthService } from './authService';
import { WebsiteGenerationService } from './websiteGenerationService';
import { TemplateService } from './templateService';

// Create singleton instances
export const authService = new AuthService();

// Export types and classes
export type { WebsiteGenerationService };
export type { TemplateService };

// Export other services as needed
export * from './websiteGenerationService';
export * from './templateService'; 