import { createApp } from 'vue'
// before App so vuetify/styles declares its CSS layers ahead of the component styles
import { registerPlugins } from '@/plugins'
import App from './App.vue'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
