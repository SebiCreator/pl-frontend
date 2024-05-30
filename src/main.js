import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { InstallCodemirro } from "codemirror-editor-vue3";
import { createVCodeBlock } from '@wdns/vue-code-block';



const pinia = createPinia()

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(InstallCodemirro, { componentName: "CodeEditor"})
app.use(createVCodeBlock)

app.mount('#app')
