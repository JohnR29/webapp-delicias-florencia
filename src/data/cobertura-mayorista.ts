/**
 * Configuración de cobertura para mayoristas
 * Define las comunas con despacho gratuito y con cobro
 */

export interface CoberturaComuna {
  nombre: string;
  tipoDespacho: 'gratuito' | 'con-cobro';
  costoDespacho?: number; // En pesos chilenos
  tiempoEntrega?: string; // Ej: "24-48 horas"
  diasEntrega?: string[]; // Días de la semana
  coordenadas: {
    lat: number;
    lng: number;
  };
  descripcion?: string;
}

// Comunas con despacho $1.000 (zona principal - precio más económico)
export const COMUNAS_DESPACHO_GRATUITO: CoberturaComuna[] = [
  {
    nombre: 'San Bernardo',
    tipoDespacho: 'con-cobro',
    costoDespacho: 1000,
    coordenadas: { lat: -33.606246, lng: -70.700462 },
    descripcion: 'Zona central de distribución'
  },
  {
    nombre: 'La Pintana',
    tipoDespacho: 'con-cobro',
    costoDespacho: 1000,
    coordenadas: { lat: -33.579463, lng: -70.648956 },
    descripcion: 'Zona de cobertura principal'
  },
  {
    nombre: 'El Bosque',
    tipoDespacho: 'con-cobro',
    costoDespacho: 1000,
    coordenadas: { lat: -33.559729, lng: -70.672550 },
    descripcion: 'Zona de cobertura principal'
  },
  {
    nombre: 'La Cisterna',
    tipoDespacho: 'con-cobro',
    costoDespacho: 1000,
    coordenadas: { lat: -33.528348, lng: -70.668608 },
    descripcion: 'Zona de cobertura principal'
  }
];

// Comunas con despacho con cobro (zona expandida) - Organizadas por costo
export const COMUNAS_DESPACHO_CON_COBRO: CoberturaComuna[] = [
  // Despacho $2.000
  {
    nombre: 'San Miguel',
    tipoDespacho: 'con-cobro',
    costoDespacho: 2000,
    coordenadas: { lat: -33.496123, lng: -70.646789 },
    descripcion: 'Zona extendida cercana'
  },
  {
    nombre: 'Pedro Aguirre Cerda',
    tipoDespacho: 'con-cobro',
    costoDespacho: 2000,
    coordenadas: { lat: -33.548876, lng: -70.651234 },
    descripcion: 'Zona extendida cercana'
  },
  // Despacho $3.000
  {
    nombre: 'Lo Espejo',
    tipoDespacho: 'con-cobro',
    costoDespacho: 3000,
    coordenadas: { lat: -33.525678, lng: -70.691234 },
    descripcion: 'Zona extendida con despacho'
  },
  {
    nombre: 'Cerrillos',
    tipoDespacho: 'con-cobro',
    costoDespacho: 3000,
    coordenadas: { lat: -33.503456, lng: -70.708901 },
    descripcion: 'Zona extendida con despacho'
  },
  {
    nombre: 'La Granja',
    tipoDespacho: 'con-cobro',
    costoDespacho: 3000,
    coordenadas: { lat: -33.540123, lng: -70.625456 },
    descripcion: 'Zona extendida con despacho'
  },
  // Despacho $4.000
  {
    nombre: 'Puente Alto',
    tipoDespacho: 'con-cobro',
    costoDespacho: 4000,
    coordenadas: { lat: -33.610987, lng: -70.575432 },
    descripcion: 'Zona extendida - mayor distancia'
  },
  {
    nombre: 'Maipú',
    tipoDespacho: 'con-cobro',
    costoDespacho: 4000,
    coordenadas: { lat: -33.508765, lng: -70.758901 },
    descripcion: 'Zona extendida - mayor distancia'
  }
];

// Todas las comunas de cobertura
export const TODAS_LAS_COMUNAS: CoberturaComuna[] = [
  ...COMUNAS_DESPACHO_GRATUITO,
  ...COMUNAS_DESPACHO_CON_COBRO
];

// Configuración de colores uniformes - todos los polígonos con el mismo estilo naranja de la app
export const COLORES_POR_COSTO = {
  1000: {  // Despacho $1.000 - precio más económico
    stroke: '#ea580c', // Naranja oscuro (color app)
    fill: '#fed7aa',   // Naranja claro (color app)
    fillOpacity: 0.25
  },
  2000: {  // Despacho $2.000 - naranja de la app
    stroke: '#ea580c', // Naranja oscuro (color app)
    fill: '#fed7aa',   // Naranja claro (color app)
    fillOpacity: 0.25
  },
  3000: {  // Despacho $3.000 - naranja de la app
    stroke: '#ea580c', // Naranja oscuro (color app)
    fill: '#fed7aa',   // Naranja claro (color app)
    fillOpacity: 0.25
  },
  4000: {  // Despacho $4.000 - naranja de la app
    stroke: '#ea580c', // Naranja oscuro (color app)
    fill: '#fed7aa',   // Naranja claro (color app)
    fillOpacity: 0.25
  }
} as const;

// Configuración de colores para el mapa (backwards compatibility)
export const COLORES_COBERTURA = {
  gratuito: COLORES_POR_COSTO[1000], // Ahora el más barato es $1.000
  'con-cobro': COLORES_POR_COSTO[3000]
} as const;

// Función para obtener información de una comuna
export function obtenerInfoComuna(nombreComuna: string): CoberturaComuna | null {
  return TODAS_LAS_COMUNAS.find(comuna => 
    comuna.nombre.toLowerCase() === nombreComuna.toLowerCase()
  ) || null;
}

// Función para obtener el costo de despacho
export function obtenerCostoDespacho(nombreComuna: string): number {
  const info = obtenerInfoComuna(nombreComuna);
  return info?.costoDespacho || 1000;
}

// Función para verificar si una comuna tiene el despacho más económico ($1.000)
export function tieneDespachoGratuito(nombreComuna: string): boolean {
  const info = obtenerInfoComuna(nombreComuna);
  return info?.costoDespacho === 1000;
}

// Función para agrupar comunas por costo de despacho
export function agruparComunasPorCosto(): Record<number, CoberturaComuna[]> {
  const grupos: Record<number, CoberturaComuna[]> = {};
  
  // Agregar comunas con el precio más económico ($1.000)
  grupos[1000] = [...COMUNAS_DESPACHO_GRATUITO];
  
  // Agrupar comunas con cobro por su costo
  COMUNAS_DESPACHO_CON_COBRO.forEach(comuna => {
    const costo = comuna.costoDespacho || 1000;
    if (!grupos[costo]) {
      grupos[costo] = [];
    }
    grupos[costo].push(comuna);
  });
  
  return grupos;
}

// Función para obtener costos únicos ordenados
export function obtenerCostosUnicos(): number[] {
  const costos = new Set<number>();
  
  // Agregar costo $1.000 para las comunas principales
  costos.add(1000);
  
  // Agregar costos de comunas con cobro
  COMUNAS_DESPACHO_CON_COBRO.forEach(comuna => {
    if (comuna.costoDespacho) {
      costos.add(comuna.costoDespacho);
    }
  });
  
  return Array.from(costos).sort((a, b) => a - b);
}

// Resumen de cobertura para mostrar en la UI
export const RESUMEN_COBERTURA = {
  totalComunas: TODAS_LAS_COMUNAS.length,
  comunasGratuitas: COMUNAS_DESPACHO_GRATUITO.length,
  comunasConCobro: COMUNAS_DESPACHO_CON_COBRO.length,
  costoMinimo: Math.min(...COMUNAS_DESPACHO_CON_COBRO.map(c => c.costoDespacho || 0)),
  costoMaximo: Math.max(...COMUNAS_DESPACHO_CON_COBRO.map(c => c.costoDespacho || 0)),
  costosUnicos: obtenerCostosUnicos()
};