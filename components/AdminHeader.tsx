"use client";
import NextImage from "next/image";

export function AdminHeader({ onLogout }: { onLogout?: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm w-full">
      <div className="w-full flex items-center justify-between p-4" style={{maxWidth: '100vw'}}>
        <div className="flex items-center">
          <NextImage src="/logo.png" alt="Short Grupo Inmobiliario" width={50} height={50} className="mr-2" />
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-blue-600">Short</h1>
            <p className="text-xs text-gray-600">Panel de Administración - Gestión de Propiedades</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
} 