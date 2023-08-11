import dayjs from 'dayjs'
export default {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  install: (app: any) => {
    app.provide('dayjs', dayjs)
  },
}
