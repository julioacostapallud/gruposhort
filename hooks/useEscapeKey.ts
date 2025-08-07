import { useEffect } from 'react'

export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isActive) {
        onEscape()
      }
    }

    if (isActive) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onEscape, isActive])
} 