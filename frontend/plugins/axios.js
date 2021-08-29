export default ({ $axios }) => {
  // todo set sensible default timeout
  $axios.defaults.timeout = 10000

  $axios.onError((error) => {
    if (error.response === undefined) {
      // todo show network errors somewhere globally
      console.log('Request Error: \n' + JSON.stringify(error))
      error.handled = true
    }

    throw error
  })
}
