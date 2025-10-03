# Template de Email para Supabase - Recuperación de Contraseña

## 📧 Configuración en Supabase Dashboard

### Ubicación
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **Settings** → **Email Templates**
3. Busca la sección **"Reset Password"** o **"Recovery"**

### Template HTML Completo

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña - Delicias Florencia</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #6B7280;
            margin-bottom: 30px;
        }
        .code-container {
            background: #F3F4F6;
            border: 2px dashed #D97706;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
        }
        .code-label {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .verification-code {
            font-size: 48px;
            font-weight: bold;
            color: #D97706;
            font-family: 'Courier New', monospace;
            letter-spacing: 8px;
            margin: 0;
        }
        .instructions {
            background: #EFF6FF;
            border-left: 4px solid #3B82F6;
            padding: 20px;
            margin: 30px 0;
            text-align: left;
        }
        .instructions h3 {
            color: #1E40AF;
            margin-top: 0;
            font-size: 16px;
        }
        .instructions ol {
            color: #374151;
            margin: 0;
            padding-left: 20px;
        }
        .instructions li {
            margin-bottom: 8px;
        }
        .warning {
            background: #FEF3C7;
            border: 1px solid #F59E0B;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400E;
            font-size: 14px;
        }
        .footer {
            background: #F9FAFB;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
        }
        .footer-text {
            font-size: 14px;
            color: #6B7280;
            margin: 0;
        }
        .brand {
            font-weight: bold;
            color: #D97706;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .content {
                padding: 30px 20px;
            }
            .verification-code {
                font-size: 36px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🧁 Delicias Florencia</div>
            <div class="subtitle">Recuperación de Contraseña</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                ¡Hola! 👋
            </div>
            
            <div class="message">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Delicias Florencia</strong>.
            </div>

            <!-- Verification Code -->
            <div class="code-container">
                <div class="code-label">Tu código de verificación:</div>
                <div class="verification-code">{{ .Token }}</div>
            </div>

            <!-- Instructions -->
            <div class="instructions">
                <h3>📋 Instrucciones:</h3>
                <ol>
                    <li>Regresa a la página de <strong>Delicias Florencia</strong></li>
                    <li>Ingresa este código de <strong>6 dígitos</strong> en el formulario</li>
                    <li>Crea tu nueva contraseña segura</li>
                    <li>¡Continúa disfrutando de nuestros productos! 🍰</li>
                </ol>
            </div>

            <!-- Warning -->
            <div class="warning">
                ⚡ <strong>Importante:</strong> Este código es válido por tiempo limitado y solo puede usarse una vez. Si no solicitaste este cambio, puedes ignorar este correo.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                Este correo fue enviado por <span class="brand">Delicias Florencia</span><br>
                Si tienes problemas, contáctanos a través de nuestra página web.
            </p>
        </div>
    </div>
</body>
</html>
```

## 📝 Template Simplificado (Alternativa)

Si prefieres un template más simple, puedes usar esta versión:

```html
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; background: #D97706; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="margin: 0;">🧁 Delicias Florencia</h1>
        <p style="margin: 5px 0 0 0;">Recuperación de Contraseña</p>
    </div>
    
    <div style="text-align: center; padding: 20px;">
        <p>¡Hola! Recibimos una solicitud para restablecer tu contraseña.</p>
        
        <div style="background: #f8f9fa; border: 2px dashed #D97706; padding: 30px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">TU CÓDIGO DE VERIFICACIÓN:</p>
            <h1 style="font-size: 48px; color: #D97706; margin: 0; font-family: monospace; letter-spacing: 4px;">{{ .Token }}</h1>
        </div>
        
        <p><strong>Instrucciones:</strong></p>
        <ol style="text-align: left; display: inline-block;">
            <li>Regresa a Delicias Florencia</li>
            <li>Ingresa este código de 6 dígitos</li>
            <li>Establece tu nueva contraseña</li>
        </ol>
        
        <p style="color: #D97706; font-size: 14px;">⚡ Este código expira pronto y solo puede usarse una vez.</p>
    </div>
</div>
```

## ⚙️ Configuración Paso a Paso

### 1. Acceder a Supabase Dashboard
- Ve a https://app.supabase.com
- Selecciona tu proyecto **webapp-delicias-florencia**

### 2. Configurar Template
- **Authentication** → **Settings** → **Email Templates**
- Busca **"Recovery / Reset Password"**
- Reemplaza el template existente con uno de los anteriores

### 3. Variables Disponibles
- `{{ .Token }}` - El código de 6 dígitos
- `{{ .Email }}` - Email del usuario
- `{{ .SiteURL }}` - URL de tu sitio
- `{{ .ProjectRef }}` - Referencia del proyecto

### 4. Configuraciones Adicionales
- **Subject:** `🔐 Tu código de recuperación - Delicias Florencia`
- **From Name:** `Delicias Florencia`
- **From Email:** Usar el email configurado en tu proyecto

## 🧪 Testing

### Probar el Template
1. Ve a tu app en desarrollo
2. Intenta recuperar contraseña
3. Revisa que el email llegue con el código
4. Verifica que el diseño se vea correctamente

### Puntos a Verificar
- ✅ El código `{{ .Token }}` se muestra correctamente
- ✅ El diseño es responsive en móviles
- ✅ Los colores coinciden con tu marca
- ✅ El texto está en español
- ✅ Las instrucciones son claras

---

**Nota:** Una vez configurado este template en Supabase, tu sistema de recuperación de contraseña con códigos de 6 dígitos funcionará completamente. El usuario recibirá un email hermoso y claro con su código de verificación.