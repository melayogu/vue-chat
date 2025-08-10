import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // 設定基礎路徑為 IIS 的子目錄
  base: '/Vuejs3Chat/',
  // 建置配置
  build: {
    // 輸出目錄
    outDir: 'dist',
    // 清空輸出目錄
    emptyOutDir: true,
    // 靜態資源目錄
    assetsDir: 'assets',
    // 產生 source map 以便除錯
    sourcemap: false,
    // 優化設定
    rollupOptions: {
      output: {
        // 靜態資源檔名格式
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
