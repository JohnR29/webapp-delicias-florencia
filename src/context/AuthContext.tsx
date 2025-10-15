"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const fetchUserProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Si no existe el perfil, intentar crearlo basado en los datos del usuario
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (!userError && userData.user) {
          const user = userData.user;
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
            // Intentar obtener el perfil nuevamente
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            setProfile(newProfile);
          } else {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    let ignore = false;
    
    // Obtener sesión inicial
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!ignore) {
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setProfile(null);
        } else {
          const currentUser = data.session?.user ?? null;
          setUser(currentUser);
          
          // Obtener perfil si hay usuario
          if (currentUser) {
            await fetchUserProfile(currentUser.id);
          } else {
            setProfile(null);
          }
        }
        setLoading(false);
      }
    });

    // Escuchar cambios en el estado de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        // Limpiar almacenamiento local cuando se cierre sesión
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Obtener perfil del usuario
        if (currentUser) {
          await fetchUserProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      } else {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser && !profile) {
          await fetchUserProfile(currentUser.id);
        } else if (!currentUser) {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, []);

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
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
        throw error;
      }

      // Limpiar el estado local
      setUser(null);
      setProfile(null);
      
      // Limpiar cualquier información almacenada localmente
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Pequeño delay antes de redirigir para asegurar que todo se limpie
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // En caso de error, forzar limpieza manual
      setUser(null);
      setProfile(null);
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
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

  // Polling para verificar cambios en el perfil (solo para usuarios no aprobados)
  useEffect(() => {
    if (!user || !profile || profile.approval_status === 'approved') return;

    const pollInterval = setInterval(async () => {
      await refreshProfile();
    }, 10000); // Verificar cada 10 segundos

    return () => clearInterval(pollInterval);
  }, [user, profile?.approval_status]);

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
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
