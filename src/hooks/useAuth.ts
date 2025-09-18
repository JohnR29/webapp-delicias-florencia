'use client';

import { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
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
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para migrar usuarios existentes sin passwordHash
  const migrateUsersIfNeeded = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const existingUsers = getStoredUsers();
      let needsMigration = false;
      
      const migratedUsers = existingUsers.map(user => {
        // Si el usuario no tiene passwordHash, necesita migración
        if (!user.passwordHash) {
          needsMigration = true;
          // No crear contraseña temporal, forzar uso de forgot password
          return {
            ...user,
            passwordHash: 'MIGRATION_REQUIRED', // Valor especial que forzará reset
            migrationNeeded: true
          };
        }
        return user;
      });

      if (needsMigration) {
        saveUsers(migratedUsers);
        
        // Si hay un usuario actual logueado y necesita migración, marcarlo
        const currentUser = localStorage.getItem('delicias_user');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          const migratedUser = migratedUsers.find(u => u.id === user.id);
          if (migratedUser && migratedUser.migrationNeeded) {
            localStorage.setItem('delicias_user', JSON.stringify(migratedUser));
          }
        }
      }
    } catch (error) {
      console.error('Error durante la migración de usuarios:', error);
    }
  };

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    if (isInitialized || typeof window === 'undefined') return; // Evitar ejecutar múltiples veces
    
    try {
      // Primero migrar usuarios si es necesario
      migrateUsersIfNeeded();
      
      const savedUser = localStorage.getItem('delicias_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } finally {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Función para registrar usuario
  const register = async (email: string, password: string, businessInfo: BusinessForm): Promise<{ success: boolean; message: string }> => {
    try {
      // Verificar si el email ya existe
      const existingUsers = getStoredUsers();
      if (existingUsers.find(u => u.email === email)) {
        return { success: false, message: 'Este email ya está registrado' };
      }

      // Validar contraseña
      if (password.length < 6) {
        return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Crear nuevo usuario
      const newUser: User = {
        id: generateUserId(),
        email,
        passwordHash,
        businessInfo,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Guardar en localStorage
      saveUser(newUser);
      existingUsers.push(newUser);
      saveUsers(existingUsers);

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true, message: 'Registro exitoso' };
    } catch (error) {
      console.error('Error during registration:', error);
      return { success: false, message: 'Error en el registro' };
    }
  };

  // Función para login
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const existingUsers = getStoredUsers();
      const user = existingUsers.find(u => u.email === email);

      if (!user) {
        return { success: false, message: 'Email o contraseña incorrectos' };
      }

      // Verificar si el usuario necesita migración
      if (user.passwordHash === 'MIGRATION_REQUIRED' || user.migrationNeeded) {
        return { 
          success: false, 
          message: 'Tu cuenta necesita ser actualizada. Por favor usa "¿Olvidaste tu contraseña?" para establecer una nueva contraseña.' 
        };
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return { success: false, message: 'Email o contraseña incorrectos' };
      }

      // Actualizar último login
      user.lastLogin = new Date().toISOString();
      const updatedUsers = existingUsers.map(u => u.id === user.id ? user : u);
      localStorage.setItem('delicias_users', JSON.stringify(updatedUsers));

      saveUser(user);
      console.log('🔐 Actualizando estado de autenticación...');
      
      // Forzar actualización inmediata y re-renderización
      const newState = {
        user,
        isAuthenticated: true,
        isLoading: false,
      };
      
      setAuthState(newState);
      
      // Forzar una segunda actualización para asegurar que todos los componentes se re-rendericen
      setTimeout(() => {
        setAuthState(prevState => ({ ...prevState }));
      }, 50);
      
      console.log('✅ Estado actualizado:', { isAuthenticated: true, user: user.email });

      return { success: true, message: 'Login exitoso' };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, message: 'Error en el login' };
    }
  };

  // Función para logout
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('delicias_user');
    }
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Función para solicitar restablecimiento de contraseña
  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const existingUsers = getStoredUsers();
      const user = existingUsers.find(u => u.email === email);

      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        return { success: true, message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
      }

      // Generar token de reset
      const resetToken = generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

      // Actualizar usuario con token
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;

      const updatedUsers = existingUsers.map(u => u.id === user.id ? user : u);
      localStorage.setItem('delicias_users', JSON.stringify(updatedUsers));

      // Enviar email con token (llamar al API)
      try {
        const response = await fetch('/api/send-password-reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            token: resetToken,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response del servidor:', response.status, errorText);
          throw new Error('Error enviando email');
        }
      } catch (emailError) {
        console.error('Error sending reset email:', emailError);
        // Aún retornamos éxito para no revelar información
      }

      return { success: true, message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return { success: false, message: 'Error al solicitar restablecimiento' };
    }
  };

  // Función para restablecer contraseña con token
  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (newPassword.length < 6) {
        return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
      }

      const existingUsers = getStoredUsers();
      const user = existingUsers.find(u => u.resetToken === token);

      if (!user || !user.resetTokenExpiry) {
        return { success: false, message: 'Token inválido o expirado' };
      }

      // Verificar si el token no ha expirado
      const now = new Date();
      const expiry = new Date(user.resetTokenExpiry);
      if (now > expiry) {
        return { success: false, message: 'Token expirado. Solicita un nuevo restablecimiento' };
      }

      // Hash de la nueva contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar usuario
      user.passwordHash = passwordHash;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      user.migrationNeeded = false; // Limpiar flag de migración
      user.lastLogin = new Date().toISOString();

      const updatedUsers = existingUsers.map(u => u.id === user.id ? user : u);
      localStorage.setItem('delicias_users', JSON.stringify(updatedUsers));

      // Login automático después del reset
      saveUser(user);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true, message: 'Contraseña restablecida exitosamente' };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, message: 'Error al restablecer contraseña' };
    }
  };
  const updateUserInfo = (updatedBusinessInfo: BusinessForm): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      try {
        if (!authState.user) {
          resolve({ success: false, message: 'Usuario no autenticado' });
          return;
        }

        const updatedUser = {
          ...authState.user,
          businessInfo: updatedBusinessInfo,
        };

        // Actualizar en todos los usuarios almacenados
        const existingUsers = getStoredUsers();
        const updatedUsers = existingUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        );
        localStorage.setItem('delicias_users', JSON.stringify(updatedUsers));

        // Guardar usuario actual
        saveUser(updatedUser);
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
        }));

        resolve({ success: true, message: 'Datos actualizados correctamente' });
      } catch (error) {
        console.error('Error updating user info:', error);
        resolve({ success: false, message: 'Error al actualizar datos' });
      }
    });
  };

  // Funciones auxiliares
  const getStoredUsers = (): User[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const users = localStorage.getItem('delicias_users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('delicias_users', JSON.stringify(users));
    }
  };

  const saveUser = (user: User) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('delicias_user', JSON.stringify(user));
  };

  const generateUserId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const generateResetToken = (): string => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
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