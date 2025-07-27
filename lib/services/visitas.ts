// lib/services/visitas.ts
import { api } from './apiClient';
import { useCallback } from 'react';

export interface EstadisticasVisitas {
  visitas_totales: number;
  visitas_pc: number;
  visitas_movil: number;
}

export interface VisitaPropiedad {
  propiedad_id: number;
  contador: EstadisticasVisitas;
  session_id: string;
}

export interface TopPropiedad {
  id: number;
  titulo: string;
  visitas_totales: number;
  visitas_pc: number;
  visitas_movil: number;
}

export interface EstadisticasPagina {
  periodo: string;
  estadisticas: EstadisticasVisitas;
}

export interface TopPropiedades {
  periodo: string;
  top_propiedades: TopPropiedad[];
}

// Función para detectar dispositivo en el cliente
export function detectDevice(): 'pc' | 'movil' {
  if (typeof window === 'undefined') return 'pc';
  
  const userAgent = navigator.userAgent;
  const mobileKeywords = [
    'Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone', 
    'BlackBerry', 'Opera Mini', 'IEMobile'
  ];
  
  return mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  ) ? 'movil' : 'pc';
}

// Función para generar session ID único
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Función para obtener session ID del localStorage o crear uno nuevo
export function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = localStorage.getItem('short_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('short_session_id', sessionId);
  }
  return sessionId;
}

export const visitas = {
  // Registrar visita a la página principal
  async registrarVisitaPagina(): Promise<{ message: string; contador: EstadisticasVisitas; session_id: string }> {
    try {
      const response = await api.create('visitas', {
        session_id: getSessionId(),
        dispositivo: detectDevice()
      });
      return response;
    } catch (error) {
      console.error('Error registrando visita a página:', error);
      throw error;
    }
  },

  // Registrar visita a una propiedad específica
  async registrarVisitaPropiedad(propiedadId: number): Promise<VisitaPropiedad> {
    try {
      const response = await api.create('visitas/propiedad', {
        propiedad_id: propiedadId,
        session_id: getSessionId(),
        dispositivo: detectDevice()
      });
      return response;
    } catch (error) {
      console.error('Error registrando visita a propiedad:', error);
      throw error;
    }
  },

  // Obtener estadísticas de visitas a la página
  async obtenerEstadisticasPagina(periodo: 'hoy' | 'semana' | 'mes' = 'hoy'): Promise<EstadisticasPagina> {
    try {
      const response = await api.list(`visitas?periodo=${periodo}`);
      return response;
    } catch (error) {
      console.error('Error obteniendo estadísticas de página:', error);
      throw error;
    }
  },

  // Obtener estadísticas de visitas a una propiedad específica
  async obtenerEstadisticasPropiedad(propiedadId: number, periodo: 'hoy' | 'semana' | 'mes' = 'hoy'): Promise<{ propiedad_id: number; periodo: string; estadisticas: EstadisticasVisitas }> {
    try {
      const response = await api.list(`visitas/propiedad?propiedad_id=${propiedadId}&periodo=${periodo}`);
      return response;
    } catch (error) {
      console.error('Error obteniendo estadísticas de propiedad:', error);
      throw error;
    }
  },

  // Obtener top propiedades más visitadas
  async obtenerTopPropiedades(): Promise<TopPropiedades> {
    try {
      const response = await api.list('visitas/propiedad');
      return response;
    } catch (error) {
      console.error('Error obteniendo top propiedades:', error);
      throw error;
    }
  }
  };

// Hook personalizado para manejar visitas
export function useVisitas() {
  const registrarVisitaPagina = useCallback(async () => {
    try {
      // Solo registrar si no se ha registrado recientemente
      const lastVisit = localStorage.getItem('short_last_page_visit');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
      
      if (!lastVisit || (now - parseInt(lastVisit)) > oneDay) {
        await visitas.registrarVisitaPagina();
        localStorage.setItem('short_last_page_visit', now.toString());
      }
    } catch (error) {
      console.error('Error en hook de visitas página:', error);
    }
  }, []);

  const registrarVisitaPropiedad = useCallback(async (propiedadId: number) => {
    try {
      // Solo registrar si no se ha visitado esta propiedad recientemente
      const lastVisitKey = `short_last_property_visit_${propiedadId}`;
      const lastVisit = localStorage.getItem(lastVisitKey);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
      
      if (!lastVisit || (now - parseInt(lastVisit)) > oneDay) {
        await visitas.registrarVisitaPropiedad(propiedadId);
        localStorage.setItem(lastVisitKey, now.toString());
      }
    } catch (error) {
      console.error('Error en hook de visitas propiedad:', error);
    }
  }, []);

  return {
    registrarVisitaPagina,
    registrarVisitaPropiedad,
    obtenerEstadisticasPagina: visitas.obtenerEstadisticasPagina,
    obtenerEstadisticasPropiedad: visitas.obtenerEstadisticasPropiedad,
    obtenerTopPropiedades: visitas.obtenerTopPropiedades
  };
} 