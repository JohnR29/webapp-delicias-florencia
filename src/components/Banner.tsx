import Link from 'next/link'

export default function Banner() {
  return (
    <section className="relative w-full h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <img
          src="/images/torta1.png"
          alt="Tortas artesanales Delicias Florencia en vaso"
          className="w-full h-full object-cover"
        />
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Contenido del banner */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img
              src="/images/logo-delicias-florencia.png"
              alt="Logo Delicias Florencia"
              width={160}
              height={160}
              className="drop-shadow-2xl"
              style={{ 
                filter: 'brightness(0) saturate(100%) invert(1)' 
              }}
            />
          </div>
          
          <h1 className="font-dancing-script text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 drop-shadow-lg">
            Delicias Florencia
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-medium mb-4 drop-shadow-md">
            Distribución mayorista de tortas caseras en vaso
          </p>
          <p className="text-sm sm:text-lg lg:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md opacity-95">
            Productos artesanales para almacenes, minimarkets y pastelerías con entrega programada
          </p>
          <Link
            href="#catalogo"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Hacer Pedido
          </Link>
        </div>
      </div>
    </section>
  )
}