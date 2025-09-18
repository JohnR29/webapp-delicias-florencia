'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Componente wrapper que se asegura de cargar solo en el cliente
function ClientOnly({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Crear versión dinámica que solo se carga en el cliente
const ClientOnlyComponent = dynamic(() => Promise.resolve(ClientOnly), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50"></div>
});

export default ClientOnlyComponent;