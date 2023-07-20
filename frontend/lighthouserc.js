module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        'http://localhost/',
        'http://localhost/login',
        'http://localhost/add',
        'http://localhost/edit',
        'http://localhost/view',
        'http://localhost/find',
        'http://localhost/manage/users',
        'http://localhost/manage/reports',
      ],
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
