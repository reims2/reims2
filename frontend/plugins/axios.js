export default ({ $axios, app }) => {
  // todo set sensible default timeout
  $axios.defaults.timeout = 10000

  $axios.onError((error) => {
    if (error.response === undefined) {
      // todo show network errors somewhere globally
      console.log('Request Error: \n' + JSON.stringify(error))
      error.handled = true
    } else if (error.response.status === 401) {
      console.log('Login no longer valid (401 received), logout')
      // todo maybe inform the user what happened
      error.handled = true
      app.$auth.logout()
    }
    throw error
  })
}
