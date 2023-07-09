import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  createPersistedState({
    paths: ['location', 'allGlasses', 'lastRefresh'],
  })(store)
}
