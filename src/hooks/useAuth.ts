'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BusinessForm, User } from '@/lib/types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });


  // Cargar usuario autenticado desde Supabase al iniciar
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data.user) {
        // Buscar datos adicionales en la tabla users
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', data.user.email)
          .single();
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    getUser();
  }, []);

  // Función para registrar usuario con Supabase
  const register = async (email: string, password: string, businessInfo: BusinessForm): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        return { success: false, message: error.message };
      }
      // No insertamos en la tabla users aquí, solo después de login
      return { success: true, message: 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.' };
    } catch (error) {
      console.error('Error during registration:', error);
      return { success: false, message: 'Error en el registro' };
    }
  };

  // Función para login con Supabase
  const login = async (email: string, password: string, businessInfo?: BusinessForm): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        return { success: false, message: error?.message || 'Email o contraseña incorrectos' };
      }
      // Buscar datos adicionales en la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      // Si el usuario no existe en la tabla users, lo insertamos ahora
      if (userError || !userData) {
        if (businessInfo) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email,
              name: businessInfo.contacto,
              businessInfo,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
            });
          if (insertError) {
            return { success: false, message: insertError.message };
          }
          // Buscar de nuevo los datos
          const { data: newUserData } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
          setAuthState({
            user: newUserData,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true, message: 'Login exitoso' };
        } else {
          return { success: false, message: 'No se encontró el usuario y no se proporcionó información de negocio.' };
        }
      }
      // Actualizar last_login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);
      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, message: 'Login exitoso' };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, message: 'Error en el login' };
    }
  };

  // Función para logout con Supabase
  const logout = async () => {
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Función para solicitar restablecimiento de contraseña con Supabase
  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return { success: false, message: 'Error al solicitar restablecimiento' };
    }
  };

  // Función para restablecer contraseña con Supabase (debe implementarse en la página de confirmación de Supabase)
  const resetPassword = async (accessToken: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (newPassword.length < 6) {
        return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Contraseña restablecida exitosamente' };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, message: 'Error al restablecer contraseña' };
    }
  };
  const updateUserInfo = async (updatedBusinessInfo: BusinessForm): Promise<{ success: boolean; message: string }> => {
    try {
      if (!authState.user) {
        return { success: false, message: 'Usuario no autenticado' };
      }
      const { error } = await supabase
        .from('users')
        .update({ businessInfo: updatedBusinessInfo })
        .eq('id', authState.user.id);
      if (error) {
        return { success: false, message: error.message };
      }
      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user!,
          businessInfo: updatedBusinessInfo,
        },
      }));
      return { success: true, message: 'Datos actualizados correctamente' };
    } catch (error) {
      console.error('Error updating user info:', error);
      return { success: false, message: 'Error al actualizar datos' };
    }
  };

  return {
    ...authState,
    register,
    login,
    logout,
    updateUserInfo,
    requestPasswordReset,
    resetPassword,
  };
}