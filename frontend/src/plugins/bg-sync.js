/* eslint-disable no-undef */
const bgSyncDispensePlugin = new workbox.backgroundSync.BackgroundSyncPlugin('reimsDispenseQueue', {
  maxRetentionTime: 60 * 24 * 60, // retry dispense for 60 days
})

const bgSyncEditPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('reimsEditQueue', {
  maxRetentionTime: 7 * 24 * 60, // retry edit for 7 days
})

const statusPlugin = {
  fetchDidSucceed: ({ response }) => {
    if (response.status >= 500) {
      // Throwing anything here will trigger fetchDidFail.
      throw new Error('Server error.')
    }
    // If it's not 5xx, use the response as-is.
    return response
  },
}

workbox.routing.registerRoute(
  /\/api\/glasses\/(un)?dispense.*/,
  new workbox.strategies.NetworkOnly({
    plugins: [statusPlugin, bgSyncDispensePlugin],
  }),
  'PUT',
)

workbox.routing.registerRoute(
  /\/api\/glasses(\/[^/]+){2}\/?/,
  new workbox.strategies.NetworkOnly({
    plugins: [statusPlugin, bgSyncEditPlugin],
  }),
  'PUT',
)
