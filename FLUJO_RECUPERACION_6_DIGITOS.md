# Flujo de Recuperación de Contraseña - 6 Dígitos

## 📋 Resumen del Sistema

Sistema de recuperación de contraseña implementado con **códigos OTP de 6 dígitos** usando Supabase Auth, reemplazando el sistema anterior de enlaces por email.

## 🚀 Flujo de Usuario

### Paso 1: Solicitar Código
- Usuario hace clic en "¿Olvidaste tu contraseña?"
- Ingresa su email registrado
- Sistema envía código de 6 dígitos vía email

### Paso 2: Verificar Código
- Usuario recibe email con código de 6 dígitos
- Ingresa el código en la interfaz
- Sistema valida código con Supabase

### Paso 3: Nueva Contraseña
- Una vez verificado el código
- Usuario ingresa nueva contraseña y confirmación
- Sistema actualiza contraseña en Supabase

## 🔧 Implementación Técnica

### Componente: `ForgotPasswordModal.tsx`

#### Estado del Componente
```typescript
const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
const [email, setEmail] = useState('');
const [code, setCode] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
```

#### Métodos Principales

1. **`handleEmailSubmit`**
   - Llama `supabase.auth.signInWithOtp({ email, type: 'recovery' })`
   - Envía código de 6 dígitos por email
   - Transición a paso 'code'

2. **`handleCodeSubmit`**
   - Llama `supabase.auth.verifyOtp({ email, token: code, type: 'recovery' })`
   - Verifica código de 6 dígitos
   - Transición a paso 'password'

3. **`handlePasswordSubmit`**
   - Llama `supabase.auth.updateUser({ password: newPassword })`
   - Actualiza contraseña del usuario
   - Cierra modal y muestra confirmación

### Validaciones Implementadas

#### Paso 1 - Email
- Campo email requerido
- Formato email válido
- Manejo de errores de Supabase

#### Paso 2 - Código
- Solo dígitos numéricos
- Exactamente 6 caracteres
- Botón habilitado solo con 6 dígitos
- Opción para regresar y cambiar email

#### Paso 3 - Contraseña
- Contraseña mínimo 6 caracteres
- Confirmación de contraseña
- Validación que coincidan las contraseñas

## 🎨 Interfaz de Usuario

### Características UX
- **Modal centrado** con overlay
- **Iconos descriptivos** para cada paso (📧, 📱, 🔐)
- **Indicadores visuales** claros del progreso
- **Mensajes de error/éxito** contextuales
- **Navegación** bidireccional entre pasos

### Diseño Responsive
- Adaptado para móviles
- Máximo ancho de 448px
- Scrollable en pantallas pequeñas
- Padding responsivo

## 🔐 Seguridad

### Ventajas del Sistema OTP
- **No hay enlaces** que puedan ser interceptados
- **Códigos de corta duración** (por defecto Supabase)
- **Un solo uso** por código generado
- **Validación server-side** con Supabase

### Flujo Seguro
1. Usuario solicita código → Supabase genera OTP
2. Código enviado por email → Canal externo seguro
3. Usuario ingresa código → Validación en servidor
4. Código válido → Sesión temporal establecida
5. Nueva contraseña → Actualización directa en BD

## 📧 Configuración de Email

### Template de Email Requerido
Para que funcione completamente, se debe configurar en Supabase:

```html
<!-- Email Template para Recovery -->
<h2>Recuperación de Contraseña - Delicias Florencia</h2>
<p>Tu código de recuperación es:</p>
<h1 style="font-size: 48px; text-align: center; color: #D97706;">{{ .Token }}</h1>
<p>Este código es válido por tiempo limitado.</p>
```

### Variables Supabase
- `{{ .Token }}` - Código de 6 dígitos
- `{{ .SiteURL }}` - URL del sitio (si se necesita)
- `{{ .Email }}` - Email del usuario

## 🧪 Testing

### Casos de Prueba
1. **Flujo completo exitoso**
   - Email válido → Código correcto → Password actualizada

2. **Validaciones de entrada**
   - Email inválido → Error mostrado
   - Código incompleto → Botón deshabilitado
   - Contraseñas no coinciden → Error mostrado

3. **Manejo de errores**
   - Email no registrado → Mensaje de Supabase
   - Código expirado → Error de validación
   - Código incorrecto → Error de validación

## 🚀 Despliegue

### Variables de Entorno Necesarias
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Configuración Supabase Auth
- Habilitar "Enable email confirmations"
- Configurar email templates
- Establecer duración de tokens OTP

## 📊 Métricas y Monitoreo

### KPIs Sugeridas
- Tasa de éxito de recuperación completa
- Tiempo promedio del flujo
- Errores más comunes por paso
- Abandono por paso del flujo

### Logs Importantes
- Solicitudes de códigos por email
- Intentos de verificación fallidos
- Actualizaciones exitosas de contraseña

---

## 🔄 Comparación con Sistema Anterior

| Aspecto | Sistema Anterior (Enlaces) | Sistema Actual (6 Dígitos) |
|---------|---------------------------|----------------------------|
| **UX** | Necesita cambiar de app/tab | Todo en la misma interfaz |
| **Seguridad** | Enlaces pueden ser interceptados | Códigos de un solo uso |
| **Experiencia móvil** | Problemas de redirección | Flujo nativo en modal |
| **Expiración** | Enlace expira muy rápido | Código con tiempo razonable |
| **Debugging** | Difícil diagnosticar problemas | Errores claros por paso |

## ✅ Estado Actual

- ✅ Implementación completa del modal
- ✅ Integración con Supabase Auth
- ✅ Validaciones y manejo de errores
- ✅ Diseño responsive y accesible
- ⏳ Configuración de template de email
- ⏳ Testing en producción

---

**Fecha de implementación:** Diciembre 2024  
**Tecnologías:** Next.js 14, TypeScript, Supabase Auth, TailwindCSS