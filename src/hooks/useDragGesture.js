import { useEffect } from 'react'

/**
 * Custom hook for handling drag-to-expand/collapse gestures on mobile sheets
 * @param {React.RefObject} sidebarRef - Reference to the sidebar element
 * @param {boolean} isMobile - Whether the viewport is mobile-sized
 * @param {string} sheetPosition - Current sheet position ('collapsed' | 'expanded')
 * @param {Function} setSheetPosition - Function to update sheet position
 */
export function useDragGesture(sidebarRef, isMobile, sheetPosition, setSheetPosition) {
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
}
