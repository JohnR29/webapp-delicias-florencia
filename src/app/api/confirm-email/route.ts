import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente de Supabase con permisos de servicio para administrar usuarios
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de confirmación requerido' },
        { status: 400 }
      );
    }

    // Verificar el token de confirmación con Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup'
    });

    if (error) {
      console.error('Error verificando token:', error);
      return NextResponse.json(
        { success: false, message: 'Token de confirmación inválido o expirado' },
        { status: 400 }
      );
    }

    const user = data.user;
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Marcar email como verificado en el perfil existente
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error actualizando perfil:', profileError);
      return NextResponse.json(
        { success: false, message: 'Error al actualizar el perfil del usuario' },
        { status: 500 }
      );
    }

    // Enviar email de notificación al usuario de que su solicitud está en espera
    try {
      await sendPendingApprovalEmail(user.email!, user.user_metadata?.display_name || '');
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError);
      // No fallar por error de email, pero registrarlo
    }

    // Enviar notificación a los admins de nueva solicitud
    try {
      await sendAdminNotificationEmail(user);
    } catch (emailError) {
      console.error('Error enviando notificación a admins:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email confirmado correctamente. Tu solicitud está ahora en espera de aprobación.'
    });

  } catch (error) {
    console.error('Error en confirmación de email:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function sendPendingApprovalEmail(email: string, nombre: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailContent = `
¡Hola ${nombre}!

Tu email ha sido confirmado exitosamente.

Tu solicitud de registro en Delicias Florencia está ahora en espera de aprobación por parte de nuestro equipo.

Próximos pasos:
• Nuestro equipo revisará tu solicitud
• Recibirás una notificación por correo cuando se apruebe tu cuenta
• Una vez aprobada, podrás acceder a precios mayoristas y realizar pedidos
• El proceso de aprobación suele tomar 1-2 días hábiles

¿Por qué necesitamos aprobación?
Como somos un negocio mayorista, necesitamos verificar que nuestros clientes son distribuidores o comerciantes legítimos.

¡Gracias por elegir Delicias Florencia!

---
Delicias Florencia
Sitio Web: https://deliciasflorencia.cl
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Confirmado - Solicitud en Espera de Aprobación - Delicias Florencia',
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>'),
  };

  await transporter.sendMail(mailOptions);
}

async function sendAdminNotificationEmail(user: any) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailContent = `
Nueva Solicitud de Usuario - Delicias Florencia

Un nuevo usuario ha confirmado su email y solicita aprobación:

DATOS DEL USUARIO:
• Nombre: ${user.user_metadata?.display_name || 'No especificado'}
• Email: ${user.email}
• Teléfono: ${user.user_metadata?.phone || 'No especificado'}
• Nombre del Negocio: ${user.user_metadata?.business_name || 'No especificado'}
• Tipo de Negocio: ${user.user_metadata?.business_type || 'No especificado'}
• Fecha de registro: ${new Date().toLocaleDateString('es-CL')}

Accede al panel de administración para revisar y aprobar esta solicitud:
https://deliciasflorencia.cl/admin

---
Sistema Automatizado - Delicias Florencia
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'johnrojas297@gmail.com', // Email del administrador
    subject: `Nueva Solicitud de Usuario - ${user.user_metadata?.display_name || user.email}`,
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>'),
  };

  await transporter.sendMail(mailOptions);
}