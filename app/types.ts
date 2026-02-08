export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{ id: string; name: string }>;
}

export interface N8nApiResponse {
  data: Workflow[];
}

export interface N8nAccount {
  id: string;
  user_id: string;
  name: string;
  base_url: string;
  api_key: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  userId?: string;
  requiresCode?: boolean;
  message?: string;
}
