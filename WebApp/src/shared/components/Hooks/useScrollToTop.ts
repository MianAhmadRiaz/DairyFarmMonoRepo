import { useEffect } from 'react';

/**
 * Custom hook to scroll to top of a specific element or window
 * @param trigger - Dependency that when changed, triggers scroll to top
 * @param elementRef - Optional ref to specific element, defaults to window
 * @param behavior - Scroll behavior: 'instant' | 'smooth'
 */
export const useScrollToTop = (
  trigger?: any,
  elementRef?: React.RefObject<HTMLElement>,
  behavior: 'instant' | 'smooth' = 'instant'
) => {
  useEffect(() => {
    if (elementRef?.current) {
      // Scroll specific element to top
      elementRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior
      });
    } else {
      // Scroll window to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior
      });
    }
  }, [trigger, elementRef, behavior]);
};

/**
 * Hook that automatically scrolls to top when component mounts
 * @param behavior - Scroll behavior: 'instant' | 'smooth'
 */
export const useScrollToTopOnMount = (
  behavior: 'instant' | 'smooth' = 'instant'
) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior
    });
  }, [behavior]);
};
