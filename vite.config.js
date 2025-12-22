import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Check if running on Vercel or Netlify
  const isVercel = env.VERCEL || process.env.VERCEL
  const isNetlify = env.NETLIFY || process.env.NETLIFY
  
  return {
    plugins: [react()],
    // If production AND NOT on Vercel/Netlify, assume GitHub Pages (or similar subdirectory host)
    base: mode === 'production' && !isVercel && !isNetlify ? '/anime-discovery/' : '/',
  }
})