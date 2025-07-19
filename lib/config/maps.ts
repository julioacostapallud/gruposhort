// lib/config/maps.ts

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export const getGoogleMapsEmbedUrl = (lat: string, lng: string, zoom: number = 15) => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key no configurada')
    return ''
  }
  
  return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${lat},${lng}&zoom=${zoom}`
} 