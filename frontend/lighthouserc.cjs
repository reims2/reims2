module.exports = {
  ci: {
    collect: {
      startServerCommand:
        'http-server --brotli --gzip -p 3000 -P http://localhost:3000? dist',
      startServerReadyPattern: 'available',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/add',
        'http://localhost:3000/edit',
        'http://localhost:3000/view',
        'http://localhost:3000/find',
        'http://localhost:3000/manage/users',
        'http://localhost:3000/manage/reports',
      ],
      settings: {
        preset: 'desktop',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
