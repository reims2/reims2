export default ({ $axios, app, store }) => {
  // todo set sensible default timeout
  $axios.defaults.timeout = 100000

  $axios.onError((error) => {
    error.status = error.response ? error.response.status : 'Network Error'
    if (!error.response) {
      error.network = true
    } else if (error.response.status >= 500) {
      error.server = true
    }

    if (error.status === 401) {
      store.commit('setError', 'Credentials no longer valid, please login again')
      app.$auth.logout()
    }
    throw error
  })

  $axios.onResponse(() => {
    // Network request successful, clear network errors
    // store.commit('clearError')
  })
}
