import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /*
   * Dev proxy: the browser calls same-origin `/api/...` and Vite forwards it to the real
   * backend. The target used to be localhost:3000 -- a backend that does not run on this
   * machine, so every request came back 502. Set VITE_API_PROXY_TARGET to override.
   */
  const target = env.VITE_API_PROXY_TARGET || 'https://api.qinvi.id'

  return {
    plugins: [
      vue(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            // Neutral on purpose: this is what a crawler reads when it is not routed to the
            // backend's SSR meta page, and the design couple's names would be wrong for
            // every real wedding.
            title: "Undangan Pernikahan",
            description: "We joyfully invite you to attend our wedding",
            image: "https://qinvi.id/img/only-logo.png",
            url: "https://qinvi.id/",
          },
        },
      }),
    ],
    // Absolute, not './': slug routes like /demo-envelop are rewritten to index.html,
    // and a relative base would resolve assets against the slug path instead of the root.
    base: '/TemaBridgerton/',
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
      },
    },
  }
})
