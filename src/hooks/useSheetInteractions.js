import { useEffect } from 'react'

/**
 * Custom hook for handling sheet expand interactions on mobile
 * Handles: click to expand, focus to expand, scroll to expand
 * @param {React.RefObject} sidebarRef - Reference to the sidebar element
 * @param {React.RefObject} citiesListRef - Reference to the cities list element
 * @param {boolean} isMobile - Whether the viewport is mobile-sized
 * @param {string} sheetPosition - Current sheet position ('collapsed' | 'expanded')
 * @param {Function} setSheetPosition - Function to update sheet position
 */
export function useSheetInteractions(sidebarRef, citiesListRef, isMobile, sheetPosition, setSheetPosition) {
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
}
