import dayjs from 'dayjs'
export default {
  install: (app: any) => {
    app.provide('dayjs', dayjs)
  },
}
