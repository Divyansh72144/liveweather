import { useMemo } from 'react'
import tzlookup from 'tz-lookup'

// Cache for timezone lookups to avoid repeated calculations
const timezoneCache = new Map()

/**
 * Get timezone for a city using lat/lon lookup with caching
 * @param {Object} city - City object with lat and lon properties
 * @returns {string} IANA timezone identifier (e.g., 'America/New_York')
 */
export function getTimezoneForCity(city) {
  const cacheKey = `${city.lat.toFixed(4)},${city.lon.toFixed(4)}`

  if (timezoneCache.has(cacheKey)) {
    return timezoneCache.get(cacheKey)
  }

  try {
    const timezone = tzlookup(city.lat, city.lon)
    timezoneCache.set(cacheKey, timezone)
    return timezone
  } catch (error) {
    console.warn(`Could not lookup timezone for ${city.name}:`, error)
    const fallback = 'UTC'
    timezoneCache.set(cacheKey, fallback)
    return fallback
  }
}

/**
 * Format local time for a city in a specific timezone
 * @param {string} timezone - IANA timezone identifier
 * @param {Date} date - Date object (defaults to current time)
 * @returns {string} Formatted time string (e.g., '14:30')
 */
export function formatLocalTime(timezone, date = new Date()) {
  try {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    })
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    console.warn(`Invalid timezone ${timezone}, falling back to UTC:`, error)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    })
  }
}

/**
 * Custom hook to get and maintain local time for a city
 * Auto-updates every minute to ensure time stays current
 * @param {Object} city - City object with lat and lon properties
 * @returns {string} Current local time for the city (e.g., '14:30')
 */
export function useCityLocalTime(city) {
  const timezone = useMemo(() => getTimezoneForCity(city), [city.lat, city.lon])

  // Use state to trigger re-renders for time updates
  const [, setTick] = useMemo(() => {
    let tick = 0
    return [tick, () => { tick = (tick + 1) % 60 }]
  }, [])

  // Update time every minute
  useMemo(() => {
    const interval = setInterval(() => {
      setTick()
    }, 60000) // Update every 60 seconds

    return () => clearInterval(interval)
  }, [setTick])

  // Calculate current time with timezone
  const localTime = useMemo(() => {
    return formatLocalTime(timezone)
  }, [timezone, Date.now()]) // Date.now() ensures recalculation

  return localTime
}

/**
 * Get static local time for a city (no auto-update)
 * Use this for cases where you don't need real-time updates
 * @param {Object} city - City object with lat and lon properties
 * @returns {string} Current local time for the city (e.g., '14:30')
 */
export function getCityLocalTime(city) {
  const timezone = getTimezoneForCity(city)
  return formatLocalTime(timezone)
}
