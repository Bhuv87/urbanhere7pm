import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();
const configuredAuthRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();

function authRedirectUrl(): string | undefined {
  if (!configuredAuthRedirect) return undefined;
  try {
    const url = new URL(configuredAuthRedirect);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    url.searchParams.set('stage', 'auth');
    return url.toString();
  } catch {
    return undefined;
  }
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl?.startsWith('https://') &&
  supabaseUrl.endsWith('.supabase.co') &&
  supabaseKey &&
  !supabaseKey.startsWith('your-')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

let recoverySession = false;
supabase?.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') recoverySession = true;
  if (event === 'SIGNED_OUT') recoverySession = false;
});

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'engineer' | 'architect' | 'official' | 'citizen';
  organization?: string;
  createdAt: string;
  lastLoginAt: string;
  isConfirmed?: boolean;
}

function profileFromUser(user: User): UserProfile {
  const role = user.user_metadata?.role;
  return {
    id: user.id,
    email: user.email || '',
    fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    role: ['engineer', 'architect', 'official', 'citizen'].includes(role) ? role : 'engineer',
    organization: user.user_metadata?.organization || '',
    createdAt: user.created_at,
    lastLoginAt: user.last_sign_in_at || user.created_at,
    isConfirmed: Boolean(user.email_confirmed_at),
  };
}

const configurationError = 'Supabase is not configured. Add the project URL and publishable key to .env.local.';

export const authService = {
  isConfigured: () => isSupabaseConfigured,
  isPasswordRecovery: () => recoverySession,

  getCurrentUser: async (): Promise<UserProfile | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return profileFromUser(data.user);
  },

  signUp: async (
    email: string,
    password: string,
    metadata: { fullName: string; role: UserProfile['role']; organization?: string }
  ): Promise<{ user: UserProfile | null; error: string | null; warning?: string | null }> => {
    if (!supabase) return { user: null, error: configurationError };
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: metadata.fullName, role: metadata.role, organization: metadata.organization },
          emailRedirectTo: authRedirectUrl(),
        },
      });
      if (error) return { user: null, error: error.message };
      if (!data.session || !data.user) {
        return { user: null, error: null, warning: 'Check your email for the Supabase confirmation link, then sign in.' };
      }
      return { user: profileFromUser(data.user), error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Could not reach Supabase.' };
    }
  },

  signIn: async (email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> => {
    if (!supabase) return { user: null, error: configurationError };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error || !data.user || !data.session) return { user: null, error: error?.message || 'Sign in failed.' };
      return { user: profileFromUser(data.user), error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Could not reach Supabase.' };
    }
  },

  resendSignupConfirmation: async (email: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: configurationError };
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: authRedirectUrl() },
      });
      return { error: error?.message || null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Could not reach Supabase.' };
    }
  },

  resetPasswordForEmail: async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!supabase) return { success: false, message: configurationError };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: authRedirectUrl() || window.location.origin + '/?stage=auth',
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'If this account exists, a recovery link has been sent. Open the link to choose a new password.' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Could not reach Supabase.' };
    }
  },

  setNewPassword: async (newPassword: string): Promise<{ success: boolean; error: string | null; user?: UserProfile }> => {
    if (!supabase) return { success: false, error: configurationError };
    if (!recoverySession) return { success: false, error: 'Open the verified Supabase recovery link first.' };
    if (newPassword.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error || !data.user) return { success: false, error: error?.message || 'Password update failed.' };
      recoverySession = false;
      return { success: true, error: null, user: profileFromUser(data.user) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Could not reach Supabase.' };
    }
  },

  signOut: async (): Promise<{ error: string | null }> => {
    if (!supabase) return { error: configurationError };
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Could not reach Supabase.' };
    }
  },
};
