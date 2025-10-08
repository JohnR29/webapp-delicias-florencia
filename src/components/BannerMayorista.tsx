import Link from 'next/link'
import Image from 'next/image'

export default function BannerMayorista() {
  return (
    <section className="relative w-full min-h-[90vh] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Imagen de fondo responsive */}
      <div className="absolute inset-0">
        {/* Imagen para móvil - enfoque en el producto */}
        <Image
          src="/images/oreo.jpg"
          alt="Distribución mayorista de tortas caseras en vaso - Delicias Florencia"
          fill
          className="block sm:hidden w-full h-full object-cover object-top"
          priority
          sizes="(max-width: 640px) 100vw, 1px"
        />
        {/* Imagen para tablet y desktop - vista más profesional */}
        <Image
          src="/images/selva-negra.jpg"
          alt="Distribución mayorista de tortas caseras en vaso - Delicias Florencia"
          fill
          className="hidden sm:block w-full h-full object-cover object-center"
          priority
          sizes="(min-width: 640px) 100vw, 1px"
        />
        {/* Overlay con gradiente mejorado */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Contenido del banner */}
      <div className="relative z-10 flex items-center justify-center min-h-[90vh] sm:h-full px-4 py-8">
        <div className="text-center text-white max-w-5xl mx-auto w-full">
          {/* Logo */}
          <div className="mb-4 sm:mb-6 flex justify-center">
            <Image
              src="/images/logo-delicias-florencia.png"
              alt="Logo Delicias Florencia"
              width={120}
              height={120}
              className="drop-shadow-2xl"
              style={{ 
                filter: 'brightness(0) saturate(100%) invert(1)',
                width: 'clamp(80px, 8vw, 160px)',
                height: 'auto'
              }}
              priority
            />
          </div>
          
          <h1 className="font-dancing-script text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
            Delicias Florencia
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-md px-2">
            Distribución mayorista de tortas<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>caseras en vaso
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium mb-6 sm:mb-8 max-w-4xl mx-auto drop-shadow-md leading-relaxed px-2">
            Productos artesanales para almacenes, minimarkets y<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>pastelerías con entrega programada
          </p>
          
          {/* Botón CTA */}
          <div className="flex justify-center px-4">
            <Link
              href="#catalogo"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold px-8 sm:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl max-w-[280px] sm:max-w-none"
            >
              Hacer Pedido
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}