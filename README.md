# Delicias Florencia - Wholesale WebApp

## 🍰 Artisan Cake Wholesale WebApp

Next.js TypeScript mobile-first web application for **Delicias
Florencia**, a wholesale distributor of artisan cakes. This app enables
business customers to browse products, manage orders, and interact with
the distribution system efficiently.

------------------------------------------------------------------------

## ✅ Features

### 🛒 Shopping Cart System

-   **Product catalog**: 3 cake flavors (Tres Leches, Selva Negra, Oreo)
    in 12oz and 9oz formats
-   **Smart cart**: Quantity management with minimum wholesale
    validation
-   **Dynamic pricing**: 3-tier pricing system based on order volume
-   **Mobile floating bar**: Cart summary always visible on mobile
    devices
-   **Persistence**: Cart state maintained during session

### 💰 Wholesale Pricing System

-   **Tier 1** (6-14 units): \$1,700 (12oz) / \$1,500 (9oz)
-   **Tier 2** (15-19 units): \$1,600 (12oz) / \$1,400 (9oz)
-   **Tier 3** (20+ units): \$1,500 (12oz) / \$1,250 (9oz)
-   **Clear visualization**: Indicators for savings and next discount
-   **Minimum order**: 6 units total

### 🗺️ Interactive Coverage Map

-   **Leaflet map**: Interactive zone display
-   **GeoJSON integration**: Local commune data
-   **Tooltips**: Detailed information per commune
-   **Coverage**: San Bernardo, La Pintana, El Bosque, La Cisterna

### ✉️ Business Order System

-   **Contact form**: Collects full commercial information
-   **Automatic email sending**: Order confirmation with details
-   **Nodemailer integration**: Reliable transactional emails
-   **Database storage**: Order history using Supabase

### 🔐 Authentication System

-   **Sign-up & login**: Full Supabase authentication
-   **Address management**: Full CRUD for business addresses
-   **Password recovery**: Token-based email system
-   **Persistent session**: Maintains login between visits

### 🏢 Partner Distributor System

-   **Public directory**: Cliente can become retail distribution partners
-   **Admin approval**: Quality control before listing on map
-   **Smart geolocation**: Automatic suggestions of nearest distributors
-   **Interactive maps**: Google Maps integration with custom markers
-   **Distance calculation**: Haversine formula for accurate proximity

### 📍 Intelligent Location Features

-   **Location permissions**: Graceful geolocation request handling
-   **Nearby suggestions**: Shows 3 closest distributors automatically
-   **Interactive maps**: Full Google Maps integration with navigation
-   **Distance display**: Precise km calculations with 1 decimal precision
-   **Address geocoding**: Automatic coordinate conversion for distributors

### 📱 Mobile-First Design

-   Fully responsive for all devices
-   Touch-friendly buttons (≥44px)
-   Smooth CSS animations and transitions
-   Progressive Web App ready (manifest.json + service worker)

------------------------------------------------------------------------

## 🏗️ Technical Architecture

### Frontend

-   **Next.js 14**: App Router with Server/Client components
-   **TypeScript**: Strict typing throughout the application
-   **Tailwind CSS**: Consistent design with custom theme
-   **React Hooks & Context API**: Global and component state management

### Backend & APIs

-   **API Routes**: Next.js endpoints for emails and orders
-   **Supabase**: PostgreSQL database with authentication
-   **Nodemailer**: Transactional email service
-   **Edge Runtime**: Optimized performance

### Mapping & GeoData

-   **React Leaflet**: Interactive, responsive maps
-   **GeoJSON**: Geographical data for communes
-   **Turf.js**: Geospatial processing

### State & Persistence

-   **Custom hooks**: `useCart`, `useAuth`, `useAddresses`
-   **Local state**: React `useState` / `useReducer`
-   **Database**: PostgreSQL via Supabase
-   **Real-time updates**: Supabase subscriptions

------------------------------------------------------------------------

## 📦 Project Structure

    src/
    ├── app/
    │   ├── api/
    │   │   ├── send-email/
    │   │   └── send-order/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── components/
    │   ├── AuthModal.tsx
    │   ├── CartSummaryBar.tsx
    │   ├── ContactForm.tsx
    │   ├── CoverageMap.tsx
    │   ├── MobileCartBar.tsx
    │   ├── PricingTiers.tsx
    │   ├── ProductCard.tsx
    │   └── ...
    ├── context/
    │   └── AuthContext.tsx
    ├── data/
    │   └── productos.ts
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useCart.ts
    │   └── useAddresses.ts
    └── lib/
        ├── types.ts
        └── supabaseClient.ts

------------------------------------------------------------------------

## 🚀 Installation & Setup

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   Supabase account
-   SMTP credentials (Gmail recommended)

### Environment Variables

Create `.env.local`:

``` env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Commands

``` bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

------------------------------------------------------------------------

## 🎨 Design System

### Colors

-   **Primary**: `#d33939` (Corporate Red)
-   **Secondary**: `#db2777` (Accent Pink)
-   **Accent**: `#f59e0b` (Highlight Gold)
-   **Gradients**: Smooth combinations of primary colors

### Typography

-   **Headings**: Dancing Script (elegant script)
-   **Body**: Poppins (modern sans-serif)
-   **Weights**: 300, 400, 500, 600, 700

### Components

-   **Cards**: Rounded corners, soft shadows
-   **Buttons**: Hover/active states, touch feedback
-   **Forms**: Visual validation, clear messages
-   **Animations**: Fade-in, slide-up, smooth bounce

------------------------------------------------------------------------

## 📊 Data Models

### Product

``` typescript
interface Product {
  key: string; 
  nombre: string;
  formato: '12oz' | '9oz';
  precio: number;
  ingredientes: string[];
  imagen: string;
  descripcion?: string;
}
```

### Cart

``` typescript
interface CartState {
  items: Record<string, number>;
  total12oz: number;
  total9oz: number;
  totalCantidad: number;
  totalMonto: number;
}
```

### BusinessForm

``` typescript
interface BusinessForm {
  negocio: string;
  contacto: string;
  telefono: string;
  tipo: 'Almacén' | 'Minimarket' | 'Pastelería' | 'Cafetería' | 'Otro';
  comuna: string;
  direccion: string;
}
```

------------------------------------------------------------------------

## 🔧 APIs & Services

### POST /api/send-email

Processes and sends orders via email: - Validates commercial data -
Generates order number - Stores order in database - Sends styled email

### POST /api/send-order

Stores orders in Supabase: - Associates with user (optional) - JSON
structured data - Returns order ID



------------------------------------------------------------------------

*Built for Delicias Florencia wholesale distribution*
