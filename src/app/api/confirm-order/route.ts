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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      orderId, 
      status,
      deliveryNotes = '',
      adminUserId // Para validar permisos en el futuro
    } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: 'Order ID y status son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el status sea válido
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Estado no válido' },
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

    // Validar transiciones de estado válidas
    if (status === 'delivered' && orderData.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, message: 'Solo se pueden marcar como entregados los pedidos confirmados' },
        { status: 400 }
      );
    }

    // Preparar los datos de actualización
    const updateData: any = {
      status: status
    };

    // Agregar campos específicos según el estado
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
      if (deliveryNotes) {
        updateData.delivery_notes = deliveryNotes;
      }
    }

    // Actualizar el estado del pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Error al actualizar el pedido', error: updateError.message },
        { status: 500 }
      );
    }

    // Enviar correo de notificación si es necesario
    if (status === 'delivered' && orderData.customer_email) {
      try {
        await sendDeliveryEmail(orderData);
      } catch (emailError) {
        console.error('Error enviando email de entrega:', emailError);
        // No fallar la actualización si el email falla
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pedido ${status === 'delivered' ? 'marcado como entregado' : 'actualizado'} exitosamente`,
      orderId: orderId,
      status: status
    });

  } catch (error) {
    console.error('Error actualizando pedido:', error);
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

async function sendDeliveryEmail(orderData: any) {
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
  
  // Formatear fecha de entrega (actual)
  const deliveryDateFormatted = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const emailContent = `
¡Perfecto ${businessInfo.contacto}!

Tu pedido ha sido ENTREGADO exitosamente.

N° de Pedido: ${orderNumber}
Estado: ENTREGADO ✅

DETALLES DE LA ENTREGA:
📅 Fecha de entrega: ${deliveryDateFormatted}
📍 Entregado en: ${businessInfo.direccion}, ${businessInfo.comuna}
🏪 Negocio: ${businessInfo.negocio}

RESUMEN DEL PEDIDO:
• Total: $${orderData.order_data?.totals?.totalMonto?.toLocaleString('es-CL') || 'N/A'}
• Cantidad total: ${orderData.order_data?.totals?.totalCantidad || 'N/A'} unidades

${orderData.delivery_notes ? `📝 Notas de entrega:\n${orderData.delivery_notes}\n\n` : ''}

PRÓXIMOS PASOS:
• Revisa que todo esté en perfecto estado
• Si tienes algún problema, contáctanos inmediatamente
• ¡Esperamos que tengas excelentes ventas!

FACTURACIÓN:
• Revisa tu correo para la factura correspondiente
• Cualquier consulta sobre facturación, escríbenos

¡Gracias por confiar en Delicias Florencia!
Esperamos verte pronto para tu próximo pedido.

---
Delicias Florencia
Tortas artesanales para tu negocio
Sitio Web: https://deliciasflorencia.cl
Fecha de entrega: ${deliveryDateFormatted}
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: orderData.customer_email,
    subject: `✅ Pedido ${orderNumber} ENTREGADO - Delicias Florencia`,
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