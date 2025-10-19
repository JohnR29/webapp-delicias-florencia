"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
  email_verified: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_date?: string;
  rejection_reason?: string;
  registered_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isApproved: boolean;
  loading: boolean;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any } | void>;
  register: (email: string, password: string, userData?: RegisterUserData) => Promise<{ error: any } | void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: any } | void>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error: any } | void>;
  refreshProfile: () => Promise<void>;
}

interface RegisterUserData {
  nombre?: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  // Fallback para limpiar sesión si detecta inconsistencia
  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  }, [loading, user]);

  // Control de concurrencia para evitar requests duplicadas
  const profileRequestRef = React.useRef<Promise<void> | null>(null);
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!user || profileLoading) {
      console.log('[fetchUserProfile] Abort: user null o profileLoading', { user, profileLoading });
      return;
    }
    setProfileLoading(true);
    if (profileRequestRef.current) {
      console.log('[fetchUserProfile] Esperando request concurrente previa');
      await profileRequestRef.current;
      setProfileLoading(false);
      return;
    }
    let triedCreate = false;
    function fetchWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout al consultar perfil en Supabase')), ms))
      ]);
    }
    profileRequestRef.current = (async () => {
      try {
        console.log('[fetchUserProfile] Consultando perfil en Supabase', { userId });
        let { data, error }: { data: UserProfile | null; error: any } = await fetchWithTimeout(
          (async () => await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single())(),
          10000
        );
        console.log('[fetchUserProfile] Resultado consulta', { data, error });
        // Si no hay data ni error, forzar setProfile(null) y no intentar más
        if (!data && !error) {
          setProfile(null);
          console.error('[fetchUserProfile] No se encontró perfil ni error. Deteniendo intentos.');
          return;
        }
        if (error && !data && user && (error.message?.toLowerCase().includes('row') || error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('no rows')) && !triedCreate) {
          triedCreate = true;
          console.warn('[fetchUserProfile] Perfil no existe, intentando crear', { user });
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              nombre: user.user_metadata?.display_name || '',
              phone: user.user_metadata?.phone || '',
              business_name: user.user_metadata?.business_name || '',
              business_type: user.user_metadata?.business_type || '',
              email_verified: user.user_metadata?.email_verified || false,
              approval_status: 'pending',
              registered_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          if (!createError) {
            console.log('[fetchUserProfile] Perfil creado, consultando de nuevo');
            const { data: newProfile, error: fetchNewError }: { data: UserProfile | null; error: any } = await fetchWithTimeout(
              (async () => await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single())(),
              10000
            );
            if (fetchNewError) {
              console.error('[fetchUserProfile] Error al consultar perfil recién creado', fetchNewError);
              setProfile(null);
            } else {
              setProfile(newProfile);
            }
          } else {
            setProfile(null);
            console.error('[fetchUserProfile] Error creando perfil:', createError);
          }
        } else if (error) {
          setProfile(null);
          console.error('[fetchUserProfile] Error consultando perfil:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        setProfile(null);
        console.error('[fetchUserProfile] Excepción general:', error);
      } finally {
        setProfileLoading(false);
        profileRequestRef.current = null;
        console.log('[fetchUserProfile] FIN carga perfil');
      }
    })();
    await profileRequestRef.current;
  }, [user, profile, profileLoading]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    let ignore = false;
    // Obtener sesión inicial
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (ignore) return;
      if (error || !data.session) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      // Solo cargar perfil si no existe ya uno en memoria
      if (currentUser && !profile && !profileLoading) {
        await fetchUserProfile(currentUser.id);
      }
      setLoading(false);
    });
    // Escuchar cambios en el estado de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        setLoading(false);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser && !profile && !profileLoading) {
          await fetchUserProfile(currentUser.id);
        }
        setLoading(false);
        return;
      }
    });
    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [fetchUserProfile, profileLoading]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error };
  };

  const register = async (email: string, password: string, userData?: RegisterUserData) => {
    setLoading(true);
    try {
      // Registrar usuario en Supabase Auth con metadata adicional
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: userData?.nombre || '',
            phone: userData?.phone || '',
            business_name: userData?.business_name || '',
            business_type: userData?.business_type || '',
          },
          emailRedirectTo: `${window.location.origin}/confirm-email`
        },
      });
      
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };


  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
    setLoading(false);
  };

  const requestPasswordReset = async (email: string) => {
    // Usar la URL de producción o desarrollo según el entorno
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectUrl = `${baseUrl}/reset-password`;
    

    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { error };
  };

  const resetPassword = async (_token: string, newPassword: string) => {
    // Supabase v2: updateUser uses the current session's access token automatically
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  // Eliminado polling de perfil para evitar parpadeos y cambios de estado innecesarios

  // Valores derivados para facilitar el uso
  const isAuthenticated = !!user;
  const isEmailVerified = profile?.email_verified ?? false;
  const isApproved = profile?.approval_status === 'approved';

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      isAuthenticated, 
      isEmailVerified,
      isApproved,
      loading, 
      profileLoading,
      login, 
      register, 
      logout, 
      requestPasswordReset, 
      resetPassword,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
