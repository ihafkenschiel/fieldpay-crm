export interface Account {
  id: string;
  name: string;
  industry: string;
  phone: string;
  website: string;
}

export interface AccountListParams {
  search?: string;
  limit?: number;
  offset?: number;
}
