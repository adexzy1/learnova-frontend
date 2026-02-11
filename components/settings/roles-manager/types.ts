export interface Role {
  id: string;
  name: string;
  description?: string;
  users?: number;
  permissions?: string[];
}
