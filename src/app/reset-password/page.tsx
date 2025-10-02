'use client';

import { Suspense } from 'react';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Delicias Florencia</h1>
          <p className="text-gray-600">Restablecer Contraseña</p>
        </div>
        
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}