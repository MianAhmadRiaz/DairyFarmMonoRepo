import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes. This ensures every new page starts from the top.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Small delay to ensure DOM is fully rendered before scrolling
    const scrollTimer = setTimeout(() => {
      // Try multiple scroll methods to ensure compatibility
      if (window.scrollTo) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }

      // Fallback for older browsers
      if (document.documentElement.scrollTop) {
        document.documentElement.scrollTop = 0;
      }

      if (document.body.scrollTop) {
        document.body.scrollTop = 0;
      }

      // Also scroll any main content containers
      const mainContainers = document.querySelectorAll(
        'main, .main-content, [role="main"]'
      );
      mainContainers.forEach(container => {
        if (container.scrollTop) {
          container.scrollTop = 0;
        }
      });
    }, 0);

    return () => clearTimeout(scrollTimer);
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
