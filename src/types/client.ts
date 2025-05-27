export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  logo: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  slug: string;
}
