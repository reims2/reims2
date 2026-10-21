import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import '@/assets/sass/toastification.scss'

export default {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  install: (app: any) => {
    app.use(Toast, {
      position: 'bottom-center',
      transition: 'Vue-Toastification__fade',
      maxToasts: 5,
      draggable: false,
    })
  },
}
