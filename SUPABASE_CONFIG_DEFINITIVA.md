# 🎯 CONFIGURACIÓN DEFINITIVA DE SUPABASE

## ⚠️ CONFIGURACIONES CRÍTICAS QUE DEBEN ESTAR EXACTAS

### 1. **URLs en Supabase Dashboard**
Ve a: `Authentication > URL Configuration`

**Site URL:**
```
https://www.deliciasflorencia.cl
```

**Redirect URLs:**
```
https://www.deliciasflorencia.cl/reset-password
http://localhost:3000/reset-password
```

### 2. **Email Template**
Ve a: `Authentication > Email Templates > Reset Password`

**Subject:**
```
Restablece tu contraseña - Delicias Florencia
```

**Template HTML:**
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

### 3. **Configuraciones de Seguridad**
Ve a: `Authentication > Settings`

- **Enable email confirmations:** ✅ ACTIVADO
- **Secure email change:** ✅ ACTIVADO  
- **Expire password reset tokens:** `3600` segundos (1 hora)

## 🔧 CAMBIOS APLICADOS EN EL CÓDIGO

### ✅ **Corregido:**
1. **Cliente Supabase unificado** - Usando `@/lib/supabaseClient` en todos lados
2. **Validación simplificada** - Solo maneja `access_token` + `refresh_token` + `type=recovery`
3. **URL dinámica** - Usa `NEXT_PUBLIC_SITE_URL` para producción
4. **Debug mejorado** - Logs claros para identificar problemas

### ✅ **Flujo esperado:**
1. Usuario solicita reset → `requestPasswordReset(email)`
2. Supabase envía email con enlace a `/reset-password?access_token=xxx&refresh_token=yyy&type=recovery`
3. Página valida tokens y establece sesión
4. Usuario actualiza contraseña con `updateUser()`

## 🚀 TESTING

Para probar que funciona correctamente:

1. **Despliega cambios:**
```bash
git add .
git commit -m "Fix: Use unified Supabase client and simplify reset logic"
git push
```

2. **Prueba flujo completo:**
   - Ir a la app en producción
   - Abrir modal de login
   - Hacer clic en "¿Olvidaste tu contraseña?"
   - Ingresar email y solicitar reset
   - Revisar email y hacer clic en enlace
   - **CRUCIAL:** Abrir DevTools (F12) → Console antes de hacer clic
   - Verificar logs de debug
   - Cambiar contraseña

## 🎯 PUNTOS CRÍTICOS DE VERIFICACIÓN

1. ✅ La URL del email debe ser: `https://www.deliciasflorencia.cl/reset-password?access_token=...`
2. ✅ Los logs deben mostrar: "Valid reset tokens found"
3. ✅ No debe aparecer: "Missing required parameters"
4. ✅ Debe establecer sesión correctamente
5. ✅ updateUser() debe funcionar sin errores

Si alguno de estos puntos falla, revisar la configuración de Supabase Dashboard.