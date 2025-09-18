import type { Metadata } from 'next'
import { Poppins, Dancing_Script } from 'next/font/google'
import StructuredData from '@/components/StructuredData'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-dancing-script',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Delicias Florencia - Distribución Mayorista de Tortas en Vaso',
  description: 'Delicias Florencia: tortas caseras en vaso para almacenes, minimarkets y pastelerías. Volúmenes mayoristas, entrega programada en la Región Metropolitana.',
  keywords: [
    'tortas mayoristas',
    'distribución tortas',
    'tortas en vaso',
    'mayorista pasteles',
    'almacenes',
    'minimarkets',
    'tortas artesanales',
    'región metropolitana',
    'tres leches',
    'selva negra',
    'oreo',
    'piña crema',
    'distribución pastelerías'
  ].join(', '),
  authors: [{ name: 'Delicias Florencia' }],
  creator: 'Delicias Florencia',
  publisher: 'Delicias Florencia',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#d33939',
  colorScheme: 'light',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://deliciasflorencia.cl',
    siteName: 'Delicias Florencia',
    title: 'Delicias Florencia - Distribución Mayorista de Tortas',
    description: 'Tortas artesanales en vaso para almacenes, minimarkets y pastelerías. Entrega programada en Región Metropolitana.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Delicias Florencia - Tortas Mayoristas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delicias Florencia - Distribución Mayorista',
    description: 'Tortas artesanales para tu negocio',
    images: ['/images/og-image.jpg'],
  },
  category: 'food',
  classification: 'business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${poppins.variable} ${dancingScript.variable}`}>
      <head>
        <StructuredData />
      </head>
      <body className={`${poppins.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}