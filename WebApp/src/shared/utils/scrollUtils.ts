/**
 * Comprehensive scroll utilities for the entire application
 */

/**
 * Scrolls to top of window immediately
 */
export const scrollToTop = () => {
  if (window.scrollTo) {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  } else {
    // Fallback for older browsers
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
};

/**
 * Scrolls to top of window with smooth animation
 */
export const smoothScrollToTop = () => {
  if (window.scrollTo) {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  } else {
    // Fallback animation for older browsers
    const scrollStep = -window.scrollY / (500 / 15);
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
      }
    }, 15);
  }
};

/**
 * Scrolls specific element to top
 */
export const scrollElementToTop = (
  element: HTMLElement,
  behavior: 'instant' | 'smooth' = 'instant'
) => {
  if (element && element.scrollTo) {
    element.scrollTo({ top: 0, left: 0, behavior });
  } else if (element) {
    element.scrollTop = 0;
  }
};

/**
 * Resets scroll position for all common scrollable containers
 */
export const resetAllScrollPositions = () => {
  // Reset main window scroll
  scrollToTop();

  // Reset common scrollable containers
  const selectors = [
    '.MuiTableContainer-root',
    '.scrollable-content',
    '[data-scrollable]',
    '.overflow-auto',
    '.overflow-y-auto',
    '.overflow-scroll'
  ];

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        scrollElementToTop(element);
      }
    });
  });
};

/**
 * Debounced scroll to top (useful for rapid navigation)
 */
let scrollTimeout: NodeJS.Timeout | null = null;
export const debouncedScrollToTop = (delay = 100) => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(() => {
    scrollToTop();
  }, delay);
};
