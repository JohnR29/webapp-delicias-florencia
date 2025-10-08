
import Link from 'next/link'
import Image from 'next/image'

export default function Banner() {
  return (
    <section className="relative w-full min-h-[90vh] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Imagen de fondo responsive */}
      <div className="absolute inset-0">
        {/* Imagen para móvil - enfoque en la torta */}
        <Image
          src="/images/tres-leches.jpg"
          alt="Tortas artesanales Delicias Florencia en vaso"
          fill
          className="block sm:hidden w-full h-full object-cover object-top"
          priority
          sizes="(max-width: 640px) 100vw, 1px"
        />
        {/* Imagen para tablet y desktop - vista más amplia */}
        <Image
          src="/images/selva-negra.jpg"
          alt="Tortas artesanales Delicias Florencia en vaso"
          fill
          className="hidden sm:block w-full h-full object-cover object-center"
          priority
          sizes="(min-width: 640px) 100vw, 1px"
        />
        {/* Overlay con gradiente mejorado */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Contenido del banner */}
      <div className="relative z-10 flex items-center justify-center min-h-[90vh] sm:h-full px-4 py-8">
        <div className="text-center text-white max-w-4xl mx-auto w-full">
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
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium mb-6 sm:mb-8 max-w-3xl mx-auto drop-shadow-md leading-relaxed px-2">
            Las tortas artesanales más deliciosas de la región.<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Frescas, caseras y con los mejores ingredientes.
          </p>
          
          {/* Botones CTA */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link
              href="#productos"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[240px] sm:min-w-0"
            >
              🍰 Ver Nuestras Tortas
            </Link>
            <Link
              href="#donde-comprar"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[240px] sm:min-w-0"
            >
              📍 ¿Dónde Comprar?
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}