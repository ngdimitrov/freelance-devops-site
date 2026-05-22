import { defineConfig } from 'vite';

// modulePreload.polyfill is disabled so Vite emits no inline <script> in the
// built index.html — this lets the CloudFront CSP drop 'unsafe-inline' from
// script-src. All targeted browsers support native modulepreload.
export default defineConfig({
  build: {
    modulePreload: { polyfill: false },
  },
});
