import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './index.css'
import CodeEditor from "simple-code-editor";


const pinia = createPinia()

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(CodeEditor)

app.mount('#app')
