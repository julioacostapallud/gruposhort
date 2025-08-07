import React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  className?: string
  text?: string
  showText?: boolean
}

export function Spinner({ 
  size = 'md', 
  color = 'primary', 
  className,
  text,
  showText = false
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const colorClasses = {
    primary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-400'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative">
        {/* Spinner principal con gradiente */}
        <div className={cn(
          'animate-spin rounded-full border-2 border-gray-200',
          sizeClasses[size]
        )}>
          <div className={cn(
            'absolute inset-0 rounded-full border-2 border-transparent border-t-current',
            colorClasses[color],
            'animate-pulse'
          )}></div>
        </div>
        
        {/* Punto central */}
        <div className={cn(
          'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
          'w-1 h-1 rounded-full',
          color === 'primary' ? 'bg-blue-600' : 
          color === 'white' ? 'bg-white' : 'bg-gray-400'
        )}></div>
      </div>
      
      {/* Texto opcional */}
      {showText && text && (
        <p className="mt-3 text-sm text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

// Spinner de carga completa para pantallas
export function LoadingScreen({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="xl" color="primary" />
        <p className="mt-4 text-lg font-medium text-gray-700">{text}</p>
      </div>
    </div>
  )
}

// Spinner compacto para botones
export function ButtonSpinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size="sm" color="white" />
      <span>{text}</span>
    </div>
  )
} 