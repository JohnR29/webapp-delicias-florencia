// ==========================
// Configuración de Administradores
// ==========================

/**
 * Lista de emails con permisos de administrador
 * Solo estos usuarios pueden acceder al panel de gestión de pedidos
 */
export const ADMIN_EMAILS = [
  'johnrojas297@gmail.com',
  // Agregar más administradores aquí según sea necesario
  // 'otro-admin@deliciasflorencia.cl',
] as const;

/**
 * Verifica si un email tiene permisos de administrador
 * @param email Email del usuario a verificar
 * @returns true si el usuario es administrador
 */
export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email as any);
}

/**
 * Configuración de roles y permisos (futuro)
 */
export const ADMIN_PERMISSIONS = {
  MANAGE_ORDERS: 'manage_orders',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_USERS: 'manage_users',
} as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];

/**
 * Configuración de roles (preparado para futuras expansiones)
 */
export const ADMIN_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    permissions: [
      ADMIN_PERMISSIONS.MANAGE_ORDERS,
      ADMIN_PERMISSIONS.VIEW_ANALYTICS,
      ADMIN_PERMISSIONS.MANAGE_USERS,
    ],
  },
  ORDER_MANAGER: {
    name: 'Gestor de Pedidos',
    permissions: [
      ADMIN_PERMISSIONS.MANAGE_ORDERS,
    ],
  },
} as const;