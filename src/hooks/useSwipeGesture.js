import { useEffect } from 'react'

/**
 * Custom hook for handling swipe gestures on mobile sheets
 * Swipe up to expand, swipe down to close
 * @param {React.RefObject} sidebarRef - Reference to the sidebar element
 * @param {React.RefObject} citiesListRef - Reference to the cities list element
 * @param {boolean} isMobile - Whether the viewport is mobile-sized
 * @param {string} sheetPosition - Current sheet position ('collapsed' | 'expanded')
 * @param {Function} setSheetPosition - Function to update sheet position
 */
export function useSwipeGesture(sidebarRef, citiesListRef, isMobile, sheetPosition, setSheetPosition) {
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
}
