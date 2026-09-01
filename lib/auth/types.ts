export type SafeUser = {
  id: string;
  name: string;
  email: string;
  hrbpId: number;
  role: string;
};

export type AuthFormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};