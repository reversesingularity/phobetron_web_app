import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8020'

/**
 * Custom hook to track page visits.
 * Call this in your App component or layout to track all page views.
 */
export const usePageTracking = () => {
  const location = useLocation()

  useEffect(() => {
    // Track page visit
    const trackVisit = async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/v1/analytics/track`, {
          path: location.pathname,
          referrer: document.referrer || null,
        })
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.debug('Analytics tracking failed:', error)
      }
    }

    trackVisit()
  }, [location.pathname])
}

/**
 * Fetch analytics statistics
 */
export const fetchAnalytics = async (days: number = 30) => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/stats`, {
    params: { days },
  })
  return response.data
}

/**
 * Fetch real-time analytics (last 5 minutes)
 */
export const fetchRealtimeAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/analytics/realtime`)
  return response.data
}
