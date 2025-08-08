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
    primary: 'border-t-blue-600',
    white: 'border-t-white',
    gray: 'border-t-gray-400'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative">
        {/* Spinner simple */}
        <div 
          className={cn(
            'rounded-full border-4 border-gray-200 animate-spin',
            sizeClasses[size],
            colorClasses[color]
          )}
        />
      </div>
      
      {/* Texto opcional */}
      {showText && text && (
        <p className="mt-3 text-sm text-gray-600 font-medium">
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