// Single source of truth for the app shell's dimensions. Sidebar, Topbar, and
// PageContainer all import from here so their offsets never drift out of sync
// with each other (previously each had its own hardcoded, mismatched values).
export const SIDEBAR_WIDTH_COLLAPSED = 72;
export const SIDEBAR_WIDTH_EXPANDED = 240;
export const TOPBAR_HEIGHT = 64;

export const getSidebarOffset = (isMobile: boolean, isCollapsed: boolean): number =>
  isMobile ? 0 : isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
