// Minimal ambient types for stylis (no bundled declarations).
// Typed loosely as a stylis plugin function so it satisfies emotion's
// createCache `stylisPlugins` option.
declare module 'stylis' {
  import type { StylisPlugin } from '@emotion/cache';
  export const prefixer: StylisPlugin;
}
