/**
 * API Client for Hazard Map
 * Provides a clean interface to backend API endpoints
 */

const BACKEND_API = import.meta.env.VITE_BACKEND_API_URL || '/api'

/**
 * API response wrapper with error handling
 */
class APIError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

/**
 * Fetch wrapper with error handling, timeout, and retry logic
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries remaining
 * @param {number} delay - Initial delay in ms
 */
async function fetchWithErrorHandling(url, options = {}, retries = 3, delay = 1000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new APIError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        await response.json().catch(() => null)
      )
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)

    // Retry on network errors or timeouts (not on 4xx client errors except 408, 429)
    const shouldRetry =
      retries > 0 &&
      (error.name === 'AbortError' ||
        error.status === 0 ||
        error.status === 408 ||
        error.status === 429 ||
        error.status >= 500)

    if (shouldRetry) {
      console.warn(`Request failed, retrying... (${retries} attempts remaining)`, error.message)

      // Exponential backoff with jitter
      const backoffDelay = delay * Math.pow(2, 3 - retries) + Math.random() * 500

      await new Promise(resolve => setTimeout(resolve, backoffDelay))

      return fetchWithErrorHandling(url, options, retries - 1, delay)
    }

    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, null)
    }

    if (error instanceof APIError) {
      throw error
    }

    throw new APIError(
      error.message || 'Network error',
      0,
      null
    )
  }
}

/**
 * Weather API endpoints
 */
export const weatherAPI = {
  /**
   * Fetch all cached weather data
   * @returns {Promise<{source: string, data: Object<string, WeatherData>>}
   */
  async getAllWeather() {
    return fetchWithErrorHandling(`${BACKEND_API}/weather`)
  },

  /**
   * Fetch weather for a specific city
   * @param {string} cityId - City ID
   * @returns {Promise<WeatherData>}
   */
  async getCityWeather(cityId) {
    const allWeather = await this.getAllWeather()
    const cityWeather = allWeather.data[cityId]

    if (!cityWeather) {
      throw new APIError(`Weather data not found for city: ${cityId}`, 404, null)
    }

    return cityWeather
  }
}

/**
 * Health check API endpoints
 */
export const healthAPI = {
  /**
   * Check backend health status
   * @returns {Promise<{status: string, cache: Object}>}
   */
  async check() {
    return fetchWithErrorHandling(`${BACKEND_API}/health`)
  }
}

/**
 * Export API client instance
 */
export const api = {
  weather: weatherAPI,
  health: healthAPI,
}

export default api
