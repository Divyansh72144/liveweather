
import { getWeatherIconUrl, getWeatherDescription, WEATHER_CATEGORIES } from '../utils/weather'
import { useEffect, useRef, useState } from 'react'

export default function Sidebar({ sortedCities, sortBy, sortOrder, onSort, onCityClick, searchQuery, onSearchChange, weatherFilter, onWeatherFilterChange, sheetPosition, setSheetPosition }) {
  const sidebarRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const citiesListRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Prevent body scroll when sheet is expanded on mobile
  useEffect(() => {
    if (!isMobile) return

    if (sheetPosition === 'expanded') {
      document.body.classList.add('sheet-open')
    } else {
      document.body.classList.remove('sheet-open')
    }

    return () => {
      document.body.classList.remove('sheet-open')
    }
  }, [sheetPosition, isMobile])

  // Update position class when sheetPosition changes
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar || !isMobile) return

    sidebar.classList.remove('sheet-expanded', 'dragging')
    if (sheetPosition === 'expanded') {
      sidebar.classList.add('sheet-expanded')
    }
  }, [sheetPosition, isMobile])

  // Handle drag to expand/collapse
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar || !isMobile) return

    const dragHandle = sidebar.querySelector('.mobile-drag-handle')
    if (!dragHandle) return

    let startY = 0
    let currentY = 0
    let isDragging = false
    const COLLAPSED_HEIGHT = 320

    const handleStart = (clientY) => {
      isDragging = true
      startY = clientY
      currentY = clientY
      sidebar.classList.add('dragging')
    }

    const handleMove = (clientY) => {
      if (!isDragging) return

      currentY = clientY
      const deltaY = clientY - startY
      const maxDrag = window.innerHeight - COLLAPSED_HEIGHT

      // Calculate visual position
      let translateY
      if (sheetPosition === 'collapsed') {
        // Starting from collapsed (at bottom), dragging up (negative delta)
        translateY = Math.max(-maxDrag, Math.min(0, -deltaY))
        sidebar.style.transform = `translateY(calc(100% - ${COLLAPSED_HEIGHT}px + ${translateY}px))`
      } else {
        // Starting from expanded (at top), dragging down (positive delta)
        translateY = Math.max(0, Math.min(maxDrag, deltaY))
        sidebar.style.transform = `translateY(${translateY}px)`
      }
    }

    const handleEnd = () => {
      if (!isDragging) return
      isDragging = false
      sidebar.classList.remove('dragging')
      sidebar.style.transform = ''

      // Determine action based on drag distance and direction
      const deltaTotal = currentY - startY
      const threshold = 30 // minimum drag distance (lower for better UX)

      if (sheetPosition === 'collapsed') {
        // Drag up from collapsed to expand
        if (deltaTotal < -threshold) {
          setSheetPosition('expanded')
        }
      } else {
        // Drag down from expanded to collapse
        if (deltaTotal > threshold) {
          setSheetPosition('collapsed')
        }
      }
    }

    const onTouchStart = (e) => {
      handleStart(e.touches[0].clientY)
    }

    const onTouchMove = (e) => {
      if (!isDragging) return
      handleMove(e.touches[0].clientY)
    }

    const onTouchEnd = () => {
      handleEnd()
    }

    const onMouseDown = (e) => {
      handleStart(e.clientY)
    }

    const onMouseMove = (e) => {
      if (!isDragging) return
      handleMove(e.clientY)
    }

    const onMouseUp = () => {
      handleEnd()
    }

    dragHandle.addEventListener('touchstart', onTouchStart, { passive: true })
    dragHandle.addEventListener('touchmove', onTouchMove, { passive: true })
    dragHandle.addEventListener('touchend', onTouchEnd)
    dragHandle.addEventListener('mousedown', onMouseDown)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      dragHandle.removeEventListener('touchstart', onTouchStart)
      dragHandle.removeEventListener('touchmove', onTouchMove)
      dragHandle.removeEventListener('touchend', onTouchEnd)
      dragHandle.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isMobile, sheetPosition, setSheetPosition])

  // Combined swipe gestures - swipe up to expand, down to close
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar || !isMobile) return

    let touchStartY = 0
    let isTracking = false

    const onTouchStart = (e) => {
      const touch = e.touches[0]
      touchStartY = touch.clientY
      isTracking = true
    }

    const onTouchMove = (e) => {
      if (!isTracking) return

      const touch = e.touches[0]
      const deltaY = touch.clientY - touchStartY

      // Check if we're scrolling in the cities list
      const citiesList = citiesListRef.current
      const isScrollingList = citiesList && e.target.closest('.cities-list')

      if (sheetPosition === 'collapsed' && deltaY < -20) {
        // Swipe up to expand
        isTracking = false
        setSheetPosition('expanded')
      } else if (sheetPosition === 'expanded' && deltaY > 50 && touch.clientY < 150 && !isScrollingList) {
        // Swipe down from top area to close, but NOT when scrolling in cities list
        isTracking = false
        setSheetPosition('collapsed')
      }
    }

    const onTouchEnd = () => {
      isTracking = false
    }

    sidebar.addEventListener('touchstart', onTouchStart, { passive: true })
    sidebar.addEventListener('touchmove', onTouchMove, { passive: true })
    sidebar.addEventListener('touchend', onTouchEnd)

    return () => {
      sidebar.removeEventListener('touchstart', onTouchStart)
      sidebar.removeEventListener('touchmove', onTouchMove)
      sidebar.removeEventListener('touchend', onTouchEnd)
    }
  }, [isMobile, sheetPosition, setSheetPosition])

  // Expand interactions - click and focus
  useEffect(() => {
    if (!isMobile || sheetPosition === 'expanded') return

    const sidebar = sidebarRef.current
    if (!sidebar) return

    const citiesList = sidebar.querySelector('.cities-list')
    const searchContainer = sidebar.querySelector('.search-container')
    const searchInput = sidebar.querySelector('.search-input')

    const expandIfNeeded = () => {
      if (sheetPosition === 'collapsed') {
        setSheetPosition('expanded')
      }
    }

    const expandSheet = (e) => {
      if (e.target.closest('button') || e.target.closest('.city-list-item')) {
        return
      }
      expandIfNeeded()
    }

    // Click handlers
    if (citiesList) {
      citiesList.addEventListener('click', expandSheet)
    }
    if (searchContainer) {
      searchContainer.addEventListener('click', expandSheet)
    }

    // Focus handler
    if (searchInput) {
      searchInput.addEventListener('focus', () => {
        expandIfNeeded()
        setTimeout(() => {
          if (searchInput && 'scrollIntoView' in searchInput) {
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 300)
      })
    }

    return () => {
      if (citiesList) {
        citiesList.removeEventListener('click', expandSheet)
      }
      if (searchContainer) {
        searchContainer.removeEventListener('click', expandSheet)
      }
      if (searchInput) {
        searchInput.removeEventListener('focus', expandIfNeeded)
      }
    }
  }, [isMobile, sheetPosition, setSheetPosition])

  // Expand on scroll (when collapsed)
  useEffect(() => {
    const list = citiesListRef.current
    if (!list || !isMobile) return

    const onScroll = () => {
      // If user tries to scroll while collapsed, expand
      if (sheetPosition === 'collapsed') {
        setSheetPosition('expanded')
      }
    }

    list.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      list.removeEventListener('scroll', onScroll)
    }
  }, [isMobile, sheetPosition, setSheetPosition])

  const handleCityClick = (city) => {
    onCityClick(city)
    if (isMobile) {
      setSheetPosition('collapsed')
    }
  }

  const closeSheet = () => setSheetPosition('collapsed')

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && sheetPosition === 'expanded' && (
        <div className="mobile-backdrop" onClick={closeSheet} />
      )}

      <aside ref={sidebarRef} className="sidebar">
        {/* Mobile drag handle */}
        <div className="mobile-drag-handle"></div>

        {/* Close button when expanded */}
        {isMobile && sheetPosition === 'expanded' && (
          <button
            className="mobile-close-button"
            onClick={closeSheet}
            aria-label="Close"
          >
            ✕
          </button>
        )}

      <h2>
        {searchQuery
          ? `Cities (${sortedCities.length} found)`
          : `Cities (${sortedCities.length})`
        }
      </h2>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search cities or countries..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => onSearchChange('')}>
            ✕
          </button>
        )}
      </div>

      {/* Weather Filter */}
      <div className="weather-filter">
        <div className="weather-filter-buttons">
          {WEATHER_CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`weather-filter-btn ${weatherFilter === category.id ? 'active' : ''}`}
              onClick={() => onWeatherFilterChange(category.id)}
              title={category.label}
            >
              {category.code ? (
                <img
                  src={getWeatherIconUrl(category.code)}
                  alt={category.label}
                  className="weather-filter-icon-img"
                />
              ) : (
                <span className="weather-filter-icon-text">🌍</span>
              )}
              <span className="weather-filter-label">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="sort-buttons">
        {['name', 'country', 'temp', 'wind'].map((sortKey) => (
          <button
            key={sortKey}
            className={`sort-btn ${sortBy === sortKey ? 'active' : ''}`}
            onClick={() => onSort(sortKey)}
          >
            {sortKey.charAt(0).toUpperCase() + sortKey.slice(1)} {sortBy === sortKey && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        ))}
      </div>

      <div className="cities-list" ref={citiesListRef}>
        {sortedCities.map(city => (
          <div
            key={city.id}
            className="city-list-item"
            onClick={() => handleCityClick(city)}
          >
            <span className="city-icon">
              <img
                src={getWeatherIconUrl(city.weather.weatherCode)}
                alt="weather"
                style={{ width: '32px', height: '32px' }}
              />
            </span>
            <div className="city-info">
              <span className="city-name">{city.name}</span>
              <span className="city-country">{city.country}</span>
              <span className="city-desc">{getWeatherDescription(city.weather.weatherCode)}</span>
            </div>
            <div className="city-metrics">
              <span className="city-temp">{city.weather.temperature}°C</span>
              <span className="city-wind">{city.weather.windSpeed} km/h</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
    </>
  )
}
