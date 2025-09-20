'use client';
import dynamic from 'next/dynamic';
const ContactForm = dynamic(() => import('./ContactForm'), { ssr: false });
export default function ClientContactForm(props: any) {
  return <ContactForm {...props} />;
}