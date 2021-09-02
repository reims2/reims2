export default ({ $axios, app, store }) => {
  // todo set sensible default timeout
  $axios.defaults.timeout = 10000

  $axios.onError((error) => {
    error.status = error.response ? error.response.status : 'Network Error'
    if (error.status === 401) {
      store.commit('setError', 'Credentials no longer valid, please login again')
      error.handled = true
      app.$auth.logout()
    }
    throw error
  })

  $axios.onResponse(() => {
    // Network request successful, clear network errors
    // store.commit('clearError')
  })
}
