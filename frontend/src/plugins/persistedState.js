import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  createPersistedState({
    paths: ['reimsSite', 'allGlasses', 'lastRefresh'],
  })(store)
}
