/* eslint-disable no-undef */
workbox.routing.registerRoute(
  /\/api\/.*/,
  new workbox.strategies.NetworkOnly({
    plugins: [new workbox.backgroundSync.BackgroundSyncPlugin('reimsDispenseQueue', {
      maxRetentionTime: 7 * 24 * 60 // retry dispense for 7 days
    })]
  }),
  'PUT'
)
