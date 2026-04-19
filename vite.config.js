import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { visualizer } from "rollup-plugin-visualizer";
// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env.API_URL': JSON.stringify(process.env.API_URL || ''),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  // define: {
  //   'process.env': process.env
  // },
  plugins: [react()],
  base: '/',
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    minify: "esbuild",
  } ,
  rollupOptions: {
    output: {
      manualChunks: {
        // تقسيم الباندل لصفحات كبيرة
        products: ['./src/pages/Products/products.jsx'],
        orders: ['./src/pages/Orders/Orders.jsx'],
      },
    },
  },
})
