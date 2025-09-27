import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessInfo,
      cart,
      products,
    } = body;

    // Crear el transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Guardar pedido en Supabase y obtener el número de pedido
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insertar pedido en la tabla orders
    // Preparar datos mínimos para el pedido
    // Si no hay user_id, usar el correo de contacto como identificador
    let orderUserId = body.user_id || body.userEmail || null;
    if (!orderUserId && businessInfo && businessInfo.correo) {
      orderUserId = businessInfo.correo;
    }
    const orderTotals = cart ? {
      totalCantidad: cart.totalCantidad,
      totalMonto: cart.totalMonto
    } : {};
    // Simplificar productos: solo nombre, formato y cantidad
    const simpleProducts = Array.isArray(products)
      ? products.map(p => ({
          nombre: p.producto?.nombre?.replace(/\s*\(.*\)/, '').trim() || '',
          formato: p.producto?.formato || '',
          cantidad: p.cantidad || 0
        }))
      : [];

    const orderDataToSave = {
      businessInfo,
      products: simpleProducts,
      totals: orderTotals
    };
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: orderUserId,
          order_data: orderDataToSave
        }
      ])
      .select('id')
      .single();
    if (orderError || !orderData) {
      return NextResponse.json({ success: false, message: 'Error al guardar el pedido en la base de datos', error: orderError?.message }, { status: 500 });
    }
    const orderNumber = `#${String(orderData.id).padStart(4, '0')}`;
    const now = new Date();

    // Agrupar productos por formato y calcular subtotales
    const formatos = ['12oz', '9oz'];
    const productosPorFormato: Record<string, { sabor: string, cantidad: number, subtotal: number }[]> = {};
    const subtotales: Record<string, number> = {};
    if (products && products.length > 0) {
      for (const formato of formatos) {
        productosPorFormato[formato] = [];
        subtotales[formato] = 0;
      }
      for (const p of products) {
        let sabor = p.producto.nombre.replace(/\s*\([^)]+\)\s*$/, '').trim();
        let formato = p.producto.formato;
        let cantidad = p.cantidad;
        let precioUnitario = p.producto.precio || 0;
        let subtotal = cantidad * precioUnitario;
        productosPorFormato[formato].push({ sabor, cantidad, subtotal });
        subtotales[formato] += subtotal;
      }
    }

    // Construir el detalle agrupado
    let pedidoDetalle = '';
    for (const formato of formatos) {
      if (productosPorFormato[formato] && productosPorFormato[formato].length > 0) {
        pedidoDetalle += '---------------------------------\n';
        pedidoDetalle += `${formato}:\n`;
        for (const prod of productosPorFormato[formato]) {
          pedidoDetalle += `-${prod.cantidad} x ${prod.sabor}\n`;
        }
        pedidoDetalle += `Subtotal: $${subtotales[formato].toLocaleString('es-CL')}\n`;
      }
    }
    if (pedidoDetalle) pedidoDetalle += '---------------------------------\n';

    const totalPedido = cart && cart.totalMonto ? cart.totalMonto : 0;

    if (!businessInfo || !businessInfo.negocio) {
      return NextResponse.json({ success: false, message: 'Faltan datos del negocio en el pedido.' }, { status: 400 });
    }

    const emailContent = `
N° de Pedido: ${orderNumber}

INFORMACIÓN DEL NEGOCIO:
• Nombre del negocio: ${businessInfo.negocio || ''}
• Persona de contacto: ${businessInfo.contacto || ''}
• Teléfono: ${businessInfo.telefono || ''}
• Tipo de negocio: ${businessInfo.tipo || ''}
• Comuna: ${businessInfo.comuna || ''}
• Dirección: ${businessInfo.direccion || ''}

${pedidoDetalle ? `DETALLE DEL PEDIDO:\n${pedidoDetalle}` : ''}
                       TOTAL: $${totalPedido.toLocaleString('es-CL')}

Fecha del pedido: ${now.toLocaleDateString('es-CL')}
Nota: Por favor confirmar disponibilidad y coordinar entrega.

Pedido enviado desde: Sitio Web Delicias Florencia
    `;

    // Configurar el email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'johnrojas297@gmail.com',
      subject: `Pedido ${orderNumber} - ${businessInfo.negocio}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>'),
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Pedido enviado correctamente' 
    });

  } catch (error) {
    console.error('Error enviando email:', error);
      return NextResponse.json(
        { success: false, message: 'Error al enviar el pedido' },
        { status: 500 }
      );
  }
}