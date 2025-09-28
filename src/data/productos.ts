import { Product } from '@/lib/types';

// ==========================
// Datos de productos migrados del script.js original
// ==========================

export const saboresData: Product[] = [
  // Formato 12oz
  {
    key: 'tres-leches-12oz',
    nombre: 'Tres Leches (12oz)',
    formato: '12oz',
    precio: 1500, // Precio base, se calcula dinámicamente
    ingredientes: ['Bizcocho Blanco', 'Tres tipos de leche', 'Crema Chantilly'],
    imagen: '/images/tres-leches.jpg',
    descripcion: 'Deliciosa torta empapada en tres tipos de leche, coronada con crema chantilly. Alto margen y rotación'
  },
  {
    key: 'selva-negra-12oz',
    nombre: 'Selva Negra (12oz)',
    formato: '12oz', 
    precio: 1500,
    ingredientes: ['Bizcocho Chocolate', 'Cerezas', 'Crema Chantilly', 'Virutas de chocolate'],
    imagen: '/images/selva-negra.jpg',
    descripcion: 'Bizcocho de chocolate con cerezas, crema chantilly y virutas de chocolate. Sabor premium'
  },
  {
    key: 'oreo-12oz',
    nombre: 'Oreo (12oz)',
    formato: '12oz',
    precio: 1500,
    ingredientes: ['Bizcocho Chocolate', 'Crema', 'Galleta Oreo', 'Manjar'],
    imagen: '/images/oreo.jpg',
    descripcion: 'Irresistible combinación de galletas Oreo con crema y capas de chocolate. Favorito de niños y jóvenes'
  },
  //{
  //  key: 'pina-crema-12oz',
  //  nombre: 'Piña Crema (12oz)',
  //  formato: '12oz',
  //  precio: 1500,
  //  ingredientes: ['Bizcocho Blanco', 'Piña', 'Crema', 'Manjar'],
  //  imagen: '/images/pina-crema.jpg',
  //  descripcion: 'Deliciosa torta de bizcocho blanco, piña, crema y manjar. Sabor tropical popular'
  //},
  
  // Formato 9oz
  {
    key: 'tres-leches-9oz',
    nombre: 'Tres Leches (9oz)',
    formato: '9oz',
    precio: 1250,
    ingredientes: ['Bizcocho Blanco', 'Tres tipos de leche', 'Crema Chantilly'],
    imagen: '/images/tres-leches.jpg',
    descripcion: 'Deliciosa torta empapada en tres tipos de leche, coronada con crema chantilly. Alto margen y rotación'
  },
  {
    key: 'selva-negra-9oz',
    nombre: 'Selva Negra (9oz)',
    formato: '9oz',
    precio: 1250,
    ingredientes: ['Bizcocho Chocolate', 'Cerezas', 'Crema Chantilly', 'Virutas de chocolate'],
    imagen: '/images/selva-negra.jpg',
    descripcion: 'Bizcocho de chocolate con cerezas, crema chantilly y virutas de chocolate. Sabor premium'
  },
  {
    key: 'oreo-9oz',
    nombre: 'Oreo (9oz)',
    formato: '9oz',
    precio: 1250,
    ingredientes: ['Bizcocho Chocolate', 'Crema', 'Galleta Oreo', 'Manjar'],
    imagen: '/images/oreo.jpg',
    descripcion: 'Irresistible combinación de galletas Oreo con crema y capas de chocolate. Favorito de niños y jóvenes'
  }//,
  //{
  //  key: 'pina-crema-9oz',
  //  nombre: 'Piña Crema (9oz)',
  //  formato: '9oz',
  //  precio: 1250,
  //  ingredientes: ['Bizcocho Blanco', 'Piña', 'Crema', 'Manjar'],
  //  imagen: '/images/pina-crema.jpg',
  //  descripcion: 'Deliciosa torta de bizcocho blanco, piña, crema y manjar. Sabor tropical popular'
  //}
];

// Productos únicos para mostrar en el catálogo (sin duplicar por formato)
export const saboresUnicos = [
  {
    key: 'tres-leches',
    nombre: 'Tres Leches',
    ingredientes: ['Bizcocho', 'Remojo tres leches', 'Manjar','Crema Chantilly'],
    imagen: '/images/tres-leches.jpg',
    descripcion: 'Deliciosa torta empapada en tres tipos de leche, coronada con crema chantilly. Alto margen y rotación'
  },
  {
    key: 'selva-negra', 
    nombre: 'Selva Negra',
    ingredientes: ['Bizcocho Chocolate', 'Mermelada de frutilla', 'Crema Chantilly', 'Chips de chocolate'],
    imagen: '/images/selva-negra.jpg',
    descripcion: 'Bizcocho de chocolate con cerezas, crema chantilly y virutas de chocolate. Sabor premium'
  },
  {
    key: 'oreo',
    nombre: 'Oreo', 
    ingredientes: ['Bizcocho Chocolate', 'Crema de oreo', 'Manjar', 'Galleta Oreo'],
    imagen: '/images/oreo.jpg',
    descripcion: 'Irresistible combinación de galletas Oreo con crema y capas de chocolate. Favorito de niños y jóvenes'
  }//,
  //{
  //  key: 'pina-crema',
  //  nombre: 'Piña Crema',
  //  ingredientes: ['Bizcocho Blanco', 'Piña', 'Crema', 'Manjar'],
  //  imagen: '/images/pina-crema.jpg',
  //  descripcion: 'Deliciosa torta de bizcocho blanco, piña, crema y manjar. Sabor tropical popular'
  //}
];