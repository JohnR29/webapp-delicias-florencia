import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface EmailRequest {
  email: string;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, token }: EmailRequest = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { message: 'Email y token son requeridos' },
        { status: 400 }
      );
    }

    // Configurar el transportador de email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Contenido del email
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recuperar Contraseña - Delicias Florencia</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .token-box {
            background: white;
            border: 2px solid #ec4899;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .token {
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            color: #be185d;
            letter-spacing: 2px;
            word-break: break-all;
          }
          .instructions {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍰 Delicias Florencia</h1>
          <h2>Recuperar Contraseña</h2>
        </div>
        
        <div class="content">
          <p>¡Hola!</p>
          
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Delicias Florencia</strong>.</p>
          
          <div class="instructions">
            <h3>📋 Instrucciones:</h3>
            <ol>
              <li>Copia el token que aparece abajo</li>
              <li>Regresa a la página de recuperación de contraseña</li>
              <li>Pega el token en el campo correspondiente</li>
              <li>Ingresa tu nueva contraseña</li>
            </ol>
          </div>
          
          <div class="token-box">
            <p><strong>Tu token de recuperación:</strong></p>
            <div class="token">${token}</div>
          </div>
          
          <p><strong>⚠️ Importante:</strong></p>
          <ul>
            <li>Este token expira en <strong>1 hora</strong></li>
            <li>Solo puede ser usado una vez</li>
            <li>Si no solicitaste este cambio, puedes ignorar este email</li>
          </ul>
          
          <p>Si tienes algún problema, no dudes en contactarnos.</p>
          
          <p>¡Gracias por confiar en Delicias Florencia! 🎂</p>
        </div>
        
        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>© ${new Date().getFullYear()} Delicias Florencia - Todos los derechos reservados</p>
        </div>
      </body>
      </html>
    `;

    // Configurar y enviar el email
    const mailOptions = {
      from: {
        name: 'Delicias Florencia',
        address: process.env.SMTP_USER || 'delicias@florencia.com'
      },
      to: email,
      subject: '🔐 Recuperar Contraseña - Delicias Florencia',
      html: emailContent,
      // Versión en texto plano como respaldo
      text: `
        Hola!
        
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Delicias Florencia.
        
        Tu token de recuperación es: ${token}
        
        Este token expira en 1 hora y solo puede ser usado una vez.
        
        Instrucciones:
        1. Copia el token de arriba
        2. Regresa a la página de recuperación de contraseña
        3. Pega el token en el campo correspondiente
        4. Ingresa tu nueva contraseña
        
        Si no solicitaste este cambio, puedes ignorar este email.
        
        ¡Gracias por confiar en Delicias Florencia!
        
        ---
        Este es un email automático, por favor no respondas a este mensaje.
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'Email de recuperación enviado exitosamente'
    });

  } catch (error) {
    console.error('Error enviando email de recuperación:', error);
    
    return NextResponse.json(
      { 
        message: 'Error interno del servidor. No se pudo enviar el email.',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}