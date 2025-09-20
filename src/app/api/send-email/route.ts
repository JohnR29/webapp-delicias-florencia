import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

    // Construir el contenido del email
    const emailContent = `
PEDIDO MAYORISTA

INFORMACIÓN DEL NEGOCIO:

${cart && cart.totalCantidad > 0 ? `
DETALLE DEL PEDIDO:
${products.map((p: any) => `- ${p.producto.nombre} (${p.producto.formato}): ${p.cantidad} unidades`).join('\n')}

RESUMEN:
` : ''}

Fecha del pedido: ${new Date().toLocaleDateString('es-CL')}
Nota: Por favor confirmar disponibilidad y coordinar entrega.

Pedido enviado desde: Sitio Web Delicias Florencia
    `;

    // Configurar el email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'johnrojas297@gmail.com',
      subject: `Pedido Mayorista - ${businessInfo.negocio}`,
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