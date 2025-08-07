// Google Analytics Configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

// Core Web Vitals tracking
export const reportWebVitals = (metric: any) => {
  if (metric.label === 'web-vital') {
    // Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      })
    }
  }
}

// Google Analytics script
export const GA_SCRIPT = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_TRACKING_ID}', {
    page_title: document.title,
    page_location: window.location.href,
  });
`

// Custom event tracking
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Property view tracking
export const trackPropertyView = (propertyId: number, propertyTitle: string) => {
  trackEvent('property_view', 'engagement', propertyTitle, propertyId)
}

// Search tracking
export const trackSearch = (filters: any) => {
  trackEvent('search', 'engagement', JSON.stringify(filters))
}

// Contact tracking
export const trackContact = (method: string, propertyId?: number) => {
  trackEvent('contact', 'engagement', method, propertyId)
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
} 