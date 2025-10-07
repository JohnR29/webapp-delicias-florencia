// Utilidad de logging inteligente para desarrollo vs producción
// Solo muestra logs en desarrollo, silencia en producción

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  // Para logs de desarrollo/debug - Solo en desarrollo
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  // Para información general - Solo en desarrollo
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  // Para warnings - Siempre se muestran pero con prefijo
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  // Para errores - Siempre se muestran
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  // Para logs específicos de geolocalización - Solo en desarrollo
  geo: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[GEO]', ...args);
    }
  },

  // Para logs específicos de mapas - Solo en desarrollo
  map: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[MAP]', ...args);
    }
  }
};

// Función para logs condicionales personalizados
export const conditionalLog = (condition: boolean, ...args: any[]) => {
  if (condition && isDevelopment) {
    console.log(...args);
  }
};