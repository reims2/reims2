export default ({ $axios, app, store }) => {
  $axios.defaults.timeout = 8000

  $axios.onError((error) => {
    error.status = error.response ? error.response.status : 'Network Error'
    if (!error.response) {
      error.network = true
    } else if (error.response.status >= 500) {
      error.server = true
    }

    try {
      error.message = error.response.data.message
    } catch (e) {
      error.message = ''
    }

    if (error.status === 401) {
      store.commit('setError', 'Credentials no longer valid, please login again')
      // TODO app.$auth.logout()
    }
    throw error
  })

  $axios.onResponse(() => {
    // Network request successful, clear network errors
    // store.commit('clearError')
  })
}
