import '@fontsource/noto-sans-kr/400.css'
import '@fontsource/noto-sans-kr/600.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
