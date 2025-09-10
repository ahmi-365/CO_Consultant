// User Types and Interfaces
export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  user_type: string;
  roles: Role[];
  onedrive_token?: string | null;
  onedrive_refresh_token?: string | null;
  onedrive_token_expires_at?: string | null;
}

export interface ApiResponse {
  data: User[];
}