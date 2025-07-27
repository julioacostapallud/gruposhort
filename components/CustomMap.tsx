import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface CustomMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  height?: string;
  width?: string;
}

export const CustomMap: React.FC<CustomMapProps> = ({ lat, lng, zoom = 16, height = '100%', width = '100%' }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) return <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400">Cargando mapa...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width, height, borderRadius: '12px' }}
      center={{ lat, lng }}
      zoom={zoom}
      options={{
        disableDefaultUI: true,
        clickableIcons: false,
        gestureHandling: 'greedy',
      }}
    >
      <Marker
        position={{ lat, lng }}
        icon={{
          url: '/icons/marker.png',
          scaledSize: new window.google.maps.Size(50, 50), // 25% más grande
        }}
      />
    </GoogleMap>
  );
}; 