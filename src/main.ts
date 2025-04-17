import { createApp } from 'vue'
import App from './App.vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import './assets/styles/main.scss'

const app = createApp(App)
app.component('v-select', vSelect)
app.mount('#app') 