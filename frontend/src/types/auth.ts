export type RecruiterUser = {
  id: string;
  email: string;
  role: string;
};

export type AuthSessionUser = {
  id?: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
};

export type AuthSession = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: AuthSessionUser;
};

export type AuthPayload = {
  user: RecruiterUser | null;
  session: AuthSession | null;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
};
