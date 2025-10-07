import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Por ahora, obtener información básica desde addresses
    // En producción, necesitarías configurar RLS y permisos apropiados
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .select(`
        user_id,
        created_at
      `)
      .not('user_id', 'is', null);

    if (addressError) {
      throw addressError;
    }

    // Agrupar por user_id y contar direcciones
    const userStats: Record<string, { count: number; first_address: string }> = {};
    
    addressData?.forEach((addr: any) => {
      if (!userStats[addr.user_id]) {
        userStats[addr.user_id] = { count: 0, first_address: addr.created_at };
      }
      userStats[addr.user_id].count++;
      if (addr.created_at < userStats[addr.user_id].first_address) {
        userStats[addr.user_id].first_address = addr.created_at;
      }
    });

    // Crear datos simulados para los socios (en producción usarías auth.users)
    const socios = Object.entries(userStats).map(([userId, stats]) => ({
      id: userId,
      email: `socio-${userId.substring(0, 8)}@example.com`, // Simulado
      created_at: stats.first_address,
      user_metadata: {
        full_name: `Socio ${userId.substring(0, 8)}` // Simulado
      },
      direcciones_count: stats.count,
      ultimo_pedido: undefined,
      estado: 'activo'
    }));

    return NextResponse.json({ 
      success: true, 
      socios: socios 
    });

  } catch (error: any) {
    console.error('Error en API de socios:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    }, { status: 500 });
  }
}