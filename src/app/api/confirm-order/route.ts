import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      orderId, 
      dispatchDate, 
      dispatchNotes = '',
      adminUserId // Para validar permisos en el futuro
    } = body;

    if (!orderId || !dispatchDate) {
      return NextResponse.json(
        { success: false, message: 'Order ID y fecha de despacho son requeridos' },
        { status: 400 }
      );
    }

    // Obtener el pedido actual
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !orderData) {
      return NextResponse.json(
        { success: false, message: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el pedido esté en estado pending
    if (orderData.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: `El pedido ya está en estado: ${orderData.status}` },
        { status: 400 }
      );
    }

    // Actualizar el estado del pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        dispatch_date: dispatchDate,
        dispatch_notes: dispatchNotes
      })
      .eq('id', orderId);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Error al actualizar el pedido', error: updateError.message },
        { status: 500 }
      );
    }

    // Enviar correo de confirmación al cliente si tiene email
    if (orderData.customer_email) {
      try {
        await sendConfirmationEmail(orderData, dispatchDate, dispatchNotes);
      } catch (emailError) {
        console.error('Error enviando email de confirmación:', emailError);
        // No fallar la confirmación si el email falla
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido confirmado exitosamente',
      orderId: orderId,
      dispatchDate: dispatchDate
    });

  } catch (error) {
    console.error('Error confirmando pedido:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(orderData: any, dispatchDate: string, dispatchNotes: string) {
  // Crear el transporter de nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const businessInfo = orderData.order_data?.businessInfo || {};
  const orderNumber = `#${String(orderData.id).padStart(4, '0')}`;
  
  // Formatear fecha de despacho
  const dispatchDateFormatted = new Date(dispatchDate).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const emailContent = `
¡Excelente noticia ${businessInfo.contacto}!

Tu pedido ha sido CONFIRMADO y está en preparación.

N° de Pedido: ${orderNumber}
Estado: CONFIRMADO ✅

DETALLES DE ENTREGA:
📅 Fecha de despacho: ${dispatchDateFormatted}
🚚 Ruta: ${businessInfo.comuna}
📍 Dirección: ${businessInfo.direccion}

${dispatchNotes ? `📝 Notas adicionales:\n${dispatchNotes}\n\n` : ''}

INFORMACIÓN DE TU PEDIDO:
• Negocio: ${businessInfo.negocio}
• Total: $${orderData.order_data?.totals?.totalMonto?.toLocaleString('es-CL') || 'N/A'}

PRÓXIMOS PASOS:
• Prepararemos tu pedido con los mejores estándares de calidad
• El día de despacho te contactaremos para coordinar la entrega
• Asegúrate de estar disponible en la dirección registrada

¿Necesitas hacer algún cambio?
Responde este correo o llámanos lo antes posible.

¡Gracias por confiar en nosotros!

---
Delicias Florencia
Tortas artesanales para tu negocio
Sitio Web: https://deliciasflorencia.cl
Fecha de confirmación: ${new Date().toLocaleDateString('es-CL')}
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: orderData.customer_email,
    subject: `✅ Pedido ${orderNumber} CONFIRMADO - Despacho ${dispatchDateFormatted}`,
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>'),
  };

  await transporter.sendMail(mailOptions);
}

// API para obtener pedidos pendientes (para el panel de admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Ahora la consulta principal
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Solo aplicar filtro de status si no es 'all'
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Error obteniendo pedidos', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0
    });

  } catch (error: any) {
    console.error('Error general obteniendo pedidos:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor', error: error.message },
      { status: 500 }
    );
  }
}