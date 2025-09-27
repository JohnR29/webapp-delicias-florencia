export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Delicias Florencia",
    "description": "Distribuidor mayorista de tortas artesanales en vaso para almacenes, minimarkets y pastelerías",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Región Metropolitana",
      "addressCountry": "CL"
    },
    "telephone": "+56-9-XXXX-XXXX",
    "email": "ventas@deliciasflorencia.cl",
    "url": "https://deliciasflorencia.cl",
    "image": "https://deliciasflorencia.cl/images/logo-delicias-florencia.png",
    "priceRange": "$1250-$1700",
    "currenciesAccepted": "CLP",
    "paymentAccepted": "Cash, Bank Transfer",
    "openingHours": "Tu,Th,Sa 09:00-18:00",
    "areaServed": [
      {
        "@type": "City",
        "name": "San Bernardo"
      },
      {
        "@type": "City", 
        "name": "La Pintana"
      },
      {
        "@type": "City",
        "name": "El Bosque"
      },
      {
        "@type": "City",
        "name": "La Cisterna"
      }
    ],
    "makesOffer": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Product",
        "name": "Tortas artesanales en vaso",
        "description": "Tortas caseras de 12oz y 9oz en sabores tres leches, selva negra, oreo y piña crema",
        "category": "Food",
        "brand": {
          "@type": "Brand",
          "name": "Delicias Florencia"
        }
      },
      "eligibleCustomerType": "Business",
      "businessFunction": "Sell"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo Mayorista",
      "itemListElement": [
        {
          "@type": "Product",
          "name": "Torta Tres Leches 12oz",
          "description": "Deliciosa torta empapada en tres tipos de leche, coronada con crema chantilly",
          "image": "https://deliciasflorencia.cl/images/tres-leches.jpg",
          "offers": {
            "@type": "Offer",
            "price": "1500-1700",
            "priceCurrency": "CLP",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Torta Selva Negra 12oz", 
          "description": "Bizcocho de chocolate con cerezas, crema chantilly y virutas de chocolate",
          "image": "https://deliciasflorencia.cl/images/selva-negra.jpg",
          "offers": {
            "@type": "Offer",
            "price": "1500-1700",
            "priceCurrency": "CLP",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Torta Oreo 12oz",
          "description": "Irresistible combinación de galletas Oreo con crema y capas de chocolate",
          "image": "https://deliciasflorencia.cl/images/oreo.jpg",
          "offers": {
            "@type": "Offer",
            "price": "1500-1700",
            "priceCurrency": "CLP", 
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Torta Piña Crema 12oz",
          "description": "Deliciosa torta de bizcocho blanco, piña, crema y manjar",
          "image": "https://deliciasflorencia.cl/images/pina-crema.jpg",
          "offers": {
            "@type": "Offer",
            "price": "1500-1700",
            "priceCurrency": "CLP",
            "availability": "https://schema.org/InStock"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}