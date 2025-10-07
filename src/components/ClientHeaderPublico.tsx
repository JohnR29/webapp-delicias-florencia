'use client';
import dynamic from 'next/dynamic';
const HeaderPublico = dynamic(() => import('./HeaderPublico'), { ssr: false });
export default function ClientHeaderPublico() {
  return <HeaderPublico />;
}