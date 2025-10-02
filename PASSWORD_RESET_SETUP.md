# Configuración de Recuperación de Contraseña - Supabase

## 🔧 Configuración requerida en Supabase Dashboard

### 1. **Site URL Configuration**
En el Dashboard de Supabase, ve a:
```
Authentication > URL Configuration
```

Configura las siguientes URLs:

- **Site URL**: `http://localhost:3000` (desarrollo) / `https://tudominio.com` (producción)
- **Redirect URLs**: 
  - `http://localhost:3000/reset-password` (desarrollo)
  - `https://tudominio.com/reset-password` (producción)

### 2. **Email Templates**
En el Dashboard, ve a:
```
Authentication > Email Templates > Reset Password
```

**Template HTML personalizado**:
```html
<!DOCTYPE html>
<html>
  <body style="font-family: 'Trebuchet MS', Arial, sans-serif; color: #5a3e36; background-color: #fff8f6; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; border: 2px solid #f3c6c2; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <tr>
        <td style="text-align: center;">
          <h2 style="color: #d16b6b; margin-bottom: 10px;">🎂 Delicias Florencia 🎂</h2>
          <p style="font-size: 15px; margin-bottom: 25px;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #e67ca5; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 3px 6px rgba(0,0,0,0.15);">
              Restablecer contraseña
            </a>
          </p>
          
          <p style="font-size: 14px; color: #7a5c58; margin-top: 30px;">
            Si tú no solicitaste este cambio, puedes ignorar este mensaje.  
          </p>
          <p style="font-size: 12px; color: #a08b87;">Este enlace expirará en 1 hora por seguridad.</p>
          
          <hr style="border: none; border-top: 1px dashed #f3c6c2; margin: 25px 0;">
          <p style="font-size: 13px; color: #9c7c76;">
            Con cariño,  
            <br><strong>Delicias Florencia</strong> 🧁
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## 🔄 Flujo completo implementado

### **1. Usuario solicita recuperación**
- Hace clic en "¿Olvidaste tu contraseña?" en el modal de login
- Se abre `ForgotPasswordModal`
- Ingresa su email y hace clic en "Enviar Enlace de Recuperación"

### **2. Sistema procesa solicitud**
- `AuthContext.requestPasswordReset()` llama a Supabase
- Supabase envía email con enlace que incluye tokens
- URL del enlace: `tudominio.com/reset-password?access_token=xxx&refresh_token=yyy&type=recovery`

### **3. Usuario hace clic en el enlace**
- Es redirigido a `/reset-password`
- `ResetPasswordForm` captura los tokens de la URL
- Establece la sesión automáticamente con los tokens

### **4. Usuario crea nueva contraseña**
- Ingresa nueva contraseña y confirmación
- `supabase.auth.updateUser({ password })` actualiza la contraseña
- Usuario es redirigido al inicio con sesión activa

## ✅ Beneficios de esta implementación

- **Seguro**: Usa tokens oficiales de Supabase
- **UX mejorada**: Flujo estándar esperado por usuarios
- **Mobile-friendly**: Funciona perfecto en dispositivos móviles
- **Consistente**: Mantiene la identidad visual de Delicias Florencia
- **Escalable**: Fácil de mantener y extender

## 🚀 Variables de entorno necesarias

En tu `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🎨 Características visuales

- **Modal centrado**: Problema de posicionamiento solucionado
- **Feedback claro**: Mensajes de éxito y error en español
- **Loading states**: Indicadores de carga durante proceso
- **Responsive**: Funciona perfecto en mobile y desktop
- **Accesible**: Labels, ARIA attributes, y navegación por teclado