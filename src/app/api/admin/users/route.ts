import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { isAdminUser } from '@/lib/admin-config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente de Supabase con permisos de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// GET: Listar solicitudes de usuarios
export async function GET(request: NextRequest) {
  try {
    // Verificar autorización del admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
    }

    // Obtener estadísticas de usuarios
    const { data: stats, error: statsError } = await supabase
      .rpc('get_user_stats');

    if (statsError) {
      console.error('Error obteniendo estadísticas:', statsError);
    }

    // Obtener lista de usuarios con información completa
    const { data: users, error: usersError } = await supabase
      .from('admin_users_view')
      .select('*')
      .order('registered_at', { ascending: false });

    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError);
      return NextResponse.json(
        { success: false, message: 'Error al obtener usuarios' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      stats: stats?.[0] || {
        total_users: 0,
        pending_approval: 0,
        approved_users: 0,
        rejected_users: 0,
        verified_emails: 0,
        unverified_emails: 0
      }
    });

  } catch (error) {
    console.error('Error en GET /api/admin/users:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Aprobar usuario
export async function POST(request: NextRequest) {
  try {
    const { userId, adminId, action, reason, userUpdates } = await request.json();

    if (!userId || !adminId || !action) {
      return NextResponse.json(
        { success: false, message: 'Datos requeridos: userId, adminId, action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'modify'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Acción inválida. Use: approve, reject, modify' },
        { status: 400 }
      );
    }

    // Verificar que el admin existe y tiene permisos
    const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(adminId);
    if (adminError || !adminUser || !isAdminUser(adminUser.user.email)) {
      return NextResponse.json({ success: false, message: 'Admin no válido' }, { status: 403 });
    }

    // Obtener datos del usuario actual
    const { data: currentUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    let updateData: any = {
      approval_admin_id: adminId,
      approval_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (action === 'approve') {
      updateData.approval_status = 'approved';
      updateData.rejection_reason = null;
    } else if (action === 'reject') {
      updateData.approval_status = 'rejected';
      updateData.rejection_reason = reason || 'No se especificó razón';
    } else if (action === 'modify' && userUpdates) {
      // Permitir modificar datos del usuario
      const allowedFields = ['nombre', 'phone', 'business_name', 'business_type'];
      for (const [key, value] of Object.entries(userUpdates)) {
        if (allowedFields.includes(key)) {
          updateData[key] = value;
        }
      }
      // Si se está modificando, mantener el estado actual a menos que se especifique
      if (!userUpdates.approval_status) {
        updateData.approval_status = currentUser.approval_status;
      } else {
        updateData.approval_status = userUpdates.approval_status;
        if (userUpdates.approval_status === 'rejected') {
          updateData.rejection_reason = reason || userUpdates.rejection_reason;
        }
      }
    }

    // Actualizar el usuario
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('Error actualizando usuario:', updateError);
      return NextResponse.json(
        { success: false, message: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    // Enviar email de notificación al usuario
    try {
      await sendUserNotificationEmail(currentUser.email, currentUser.nombre, action, reason);
    } catch (emailError) {
      console.error('Error enviando email de notificación:', emailError);
      // No fallar por error de email
    }

    return NextResponse.json({
      success: true,
      message: `Usuario ${action === 'approve' ? 'aprobado' : action === 'reject' ? 'rechazado' : 'modificado'} correctamente`
    });

  } catch (error) {
    console.error('Error en POST /api/admin/users:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar usuario (solo admins)
export async function DELETE(request: NextRequest) {
  try {
    const { userId, adminId } = await request.json();

    if (!userId || !adminId) {
      return NextResponse.json(
        { success: false, message: 'Se requiere userId y adminId' },
        { status: 400 }
      );
    }

    // Verificar permisos de admin
    const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(adminId);
    if (adminError || !adminUser || !isAdminUser(adminUser.user.email)) {
      return NextResponse.json({ success: false, message: 'Sin permisos de admin' }, { status: 403 });
    }

    // Eliminar usuario de Auth y Profile (cascade eliminará el perfil automáticamente)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error eliminando usuario:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Error al eliminar usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/admin/users:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function sendUserNotificationEmail(email: string, nombre: string, action: string, reason?: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let subject = '';
  let emailContent = '';

  if (action === 'approve') {
    subject = '¡Cuenta Aprobada! - Bienvenido a Delicias Florencia';
    emailContent = `
¡Hola ${nombre}!

¡Excelentes noticias! Tu cuenta ha sido aprobada exitosamente.

Ya puedes acceder a todos los beneficios de Delicias Florencia:
• Precios mayoristas especiales
• Realizar pedidos online
• Seguimiento de tus pedidos
• Soporte personalizado

Para comenzar:
1. Inicia sesión en https://deliciasflorencia.cl/login
2. Explora nuestro catálogo de productos
3. Realiza tu primer pedido

¡Bienvenido a la familia Delicias Florencia!

---
Delicias Florencia
Sitio Web: https://deliciasflorencia.cl
    `;
  } else if (action === 'reject') {
    subject = 'Solicitud de Cuenta - Delicias Florencia';
    emailContent = `
Hola ${nombre},

Lamentamos informarte que tu solicitud de cuenta no pudo ser aprobada en este momento.

${reason ? `Razón: ${reason}` : ''}

Si crees que esto es un error o deseas más información, puedes:
• Responder a este correo con más información sobre tu negocio
• Contactarnos directamente para aclarar cualquier duda

Valoramos tu interés en Delicias Florencia y esperamos poder trabajar contigo en el futuro.

---
Delicias Florencia
Sitio Web: https://deliciasflorencia.cl
    `;
  } else if (action === 'modify') {
    subject = 'Información de Cuenta Actualizada - Delicias Florencia';
    emailContent = `
Hola ${nombre},

Tu información de cuenta ha sido actualizada por nuestro equipo administrativo.

Si tienes alguna pregunta sobre estos cambios, no dudes en contactarnos.

---
Delicias Florencia
Sitio Web: https://deliciasflorencia.cl
    `;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>'),
  };

  await transporter.sendMail(mailOptions);
}