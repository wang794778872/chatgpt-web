import type { App } from 'vue'
import { createPinia } from 'pinia'

export const store = createPinia()

export function setupStore(app: App) {
  console.log('setupStore')
  app.use(store)
}

export * from './modules'
