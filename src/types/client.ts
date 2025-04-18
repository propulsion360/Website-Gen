export interface Client {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  createdAt: string;
  updatedAt: string;
} 