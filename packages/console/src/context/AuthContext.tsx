import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { MedXAIClient } from '@medxai/fhir-client';
import { getConfig } from '../config.js';

// =============================================================================
// Types
// =============================================================================

export interface UserInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface ProjectInfo {
  id: string;
  name?: string;
}

export interface MembershipInfo {
  id: string;
  admin?: boolean;
}

export interface AuthState {
  loading: boolean;
  authenticated: boolean;
  user: UserInfo | null;
  project: ProjectInfo | null;
  membership: MembershipInfo | null;
  client: MedXAIClient;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useClient(): MedXAIClient {
  return useAuth().client;
}

// =============================================================================
// Helper: fetch /auth/me with bearer token
// =============================================================================

async function fetchAuthMe(baseUrl: string, token: string): Promise<Record<string, any> | null> {
  try {
    const resp = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return null;
    return (await resp.json()) as Record<string, any>;
  } catch {
    return null;
  }
}

// =============================================================================
// Provider
// =============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const config = useMemo(() => getConfig(), []);
  const client = useMemo(() => {
    const c = new MedXAIClient({
      baseUrl: config.baseUrl,
      cacheTime: config.cacheTime,
    });
    c.setAutoBatch(true, config.autoBatchTime);
    return c;
  }, [config]);

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [membership, setMembership] = useState<MembershipInfo | null>(null);

  const applyMe = useCallback((me: Record<string, any> | null): boolean => {
    if (!me) {
      setAuthenticated(false);
      setUser(null);
      setProject(null);
      setMembership(null);
      return false;
    }
    setUser(me.user ?? null);
    setProject(me.project ?? null);
    setMembership(me.membership ?? null);
    setAuthenticated(true);
    return true;
  }, []);

  // Try to restore session on mount
  useEffect(() => {
    const token = sessionStorage.getItem('medxai_access_token');
    if (token) {
      client.setAccessToken(token);
      fetchAuthMe(config.baseUrl, token).then((me) => {
        if (!applyMe(me)) {
          sessionStorage.removeItem('medxai_access_token');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await client.signIn(email, password, 'openid offline');
      if (result.accessToken) {
        sessionStorage.setItem('medxai_access_token', result.accessToken);
        const me = await fetchAuthMe(config.baseUrl, result.accessToken);
        applyMe(me);
      }
    },
    [client, config.baseUrl, applyMe],
  );

  const signOut = useCallback(() => {
    client.signOut();
    sessionStorage.removeItem('medxai_access_token');
    setAuthenticated(false);
    setUser(null);
    setProject(null);
    setMembership(null);
  }, [client]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      authenticated,
      user,
      project,
      membership,
      client,
      signIn,
      signOut,
    }),
    [loading, authenticated, user, project, membership, client, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
