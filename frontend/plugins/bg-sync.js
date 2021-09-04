/* eslint-disable no-undef */
workbox.routing.registerRoute(
  /\/api\/glasses\/dispense\/.*/,
  new workbox.strategies.NetworkOnly({
    plugins: [new workbox.backgroundSync.BackgroundSyncPlugin('reimsDispenseQueue', {
      maxRetentionTime: 7 * 24 * 60 // retry dispense for 7 days
    })]
  }),
  'PUT'
)

workbox.routing.registerRoute(
  /\/api\/glasses\/undispense.*/,
  new workbox.strategies.NetworkOnly({
    plugins: [new workbox.backgroundSync.BackgroundSyncPlugin('reimsUndispenseQueue', {
      maxRetentionTime: 7 * 24 * 60 // retry undispense for 7 days
    })]
  }),
  'POST'
)
