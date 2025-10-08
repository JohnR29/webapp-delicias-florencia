"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any } | void>;
  register: (email: string, password: string, nombre?: string) => Promise<{ error: any } | void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: any } | void>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error: any } | void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data, error }) => {
      if (!ignore) {
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
        } else {
          setUser(data.session?.user ?? null);
        }
        setLoading(false);
      }
    });

    // Escuchar cambios en el estado de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        // Limpiar almacenamiento local cuando se cierre sesión
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      } else {
        setUser(session?.user ?? null);
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

  const register = async (email: string, password: string, nombre?: string) => {
    setLoading(true);
    // Registrar usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: nombre || '',
        },
      },
    });
    setLoading(false);
    return { error };
  };


  const logout = async () => {
    console.log('🚪 Iniciando logout...');
    setLoading(true);
    try {
      // Cerrar sesión en Supabase
      console.log('📝 Cerrando sesión en Supabase...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
        throw error;
      }
      console.log('✅ Sesión cerrada en Supabase');
      
      // Limpiar el estado local
      console.log('🧹 Limpiando estado local...');
      setUser(null);
      
      // Limpiar cualquier información almacenada localmente
      if (typeof window !== 'undefined') {
        console.log('🗑️ Limpiando localStorage y sessionStorage...');
        localStorage.clear();
        sessionStorage.clear();
      }
      
      console.log('✅ Logout completado exitosamente');
      
      // Pequeño delay antes de redirigir para asegurar que todo se limpie
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log('🔄 Redirigiendo a página principal...');
          window.location.href = '/';
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // En caso de error, forzar limpieza manual
      setUser(null);
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout, requestPasswordReset, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
