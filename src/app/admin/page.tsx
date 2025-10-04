import { Metadata } from 'next';
import AdminPanel from '@/components/AdminPanel';

export const metadata: Metadata = {
  title: 'Panel de Administración - Delicias Florencia',
  description: 'Gestión de pedidos mayoristas',
};

export default function AdminPage() {
  return <AdminPanel />;
}