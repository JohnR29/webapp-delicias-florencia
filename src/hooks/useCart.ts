'use client';

import { useState, useCallback, useMemo } from 'react';
import { CartState, Product } from '@/lib/types';
import { calcularTotales, PRICING_CONFIG } from '@/lib/types';

export function useCart(productos: Product[]) {
  const [items, setItems] = useState<Record<string, number>>({});

  // Calcular estado del carrito usando memo para optimización
  const cartState = useMemo((): CartState => {
    return calcularTotales(items, productos);
  }, [items, productos]);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback((productKey: string, cantidad: number) => {
    setItems(prev => ({
      ...prev,
      [productKey]: Math.max(0, cantidad)
    }));
  }, []);

  // Incrementar cantidad
  const incrementQuantity = useCallback((productKey: string) => {
    setItems(prev => ({
      ...prev,
      [productKey]: (prev[productKey] || 0) + 1
    }));
  }, []);

  // Decrementar cantidad
  const decrementQuantity = useCallback((productKey: string) => {
    setItems(prev => {
      const currentQuantity = prev[productKey] || 0;
      if (currentQuantity <= 0) return prev;
      
      return {
        ...prev,
        [productKey]: currentQuantity - 1
      };
    });
  }, []);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setItems({});
  }, []);

  // Verificar si cumple pedido mínimo
  const cumpleMinimoMayorista = cartState.totalCantidad >= PRICING_CONFIG.MINIMO_PEDIDO;

  // Calcular cuántas unidades faltan para siguiente tier
  const unidadesHastaSiguienteTier = useMemo(() => {
    if (cartState.totalCantidad < PRICING_CONFIG.UMBRAL_TIER2) {
      return PRICING_CONFIG.UMBRAL_TIER2 - cartState.totalCantidad;
    } else if (cartState.totalCantidad < PRICING_CONFIG.UMBRAL_TIER3) {
      return PRICING_CONFIG.UMBRAL_TIER3 - cartState.totalCantidad;
    }
    return 0;
  }, [cartState.totalCantidad]);

  // Obtener tier actual
  const tierActual = useMemo(() => {
    if (cartState.totalCantidad >= PRICING_CONFIG.UMBRAL_TIER3) return 3;
    if (cartState.totalCantidad >= PRICING_CONFIG.UMBRAL_TIER2) return 2;
    if (cartState.totalCantidad >= PRICING_CONFIG.MINIMO_PEDIDO) return 1;
    return 0;
  }, [cartState.totalCantidad]);

  // Obtener productos seleccionados con detalles
  const productosSeleccionados = useMemo(() => {
    return Object.entries(items)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([productKey, cantidad]) => {
        const producto = productos.find(p => p.key === productKey);
        return producto ? { producto, cantidad } : null;
      })
      .filter(Boolean) as Array<{ producto: Product; cantidad: number }>;
  }, [items, productos]);

  return {
    items,
    cartState,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    cumpleMinimoMayorista,
    unidadesHastaSiguienteTier,
    tierActual,
    productosSeleccionados
  };
}