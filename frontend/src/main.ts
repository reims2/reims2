import { createApp } from 'vue'
// before App so vuetify/styles declares its CSS layers ahead of the component styles
import { registerPlugins } from '@/plugins'
import App from './App.vue'
import { installErrorReporting } from '@/lib/error-report'

const app = createApp(App)

registerPlugins(app)
installErrorReporting(app)

app.mount('#app')
