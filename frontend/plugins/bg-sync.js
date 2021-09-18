/* eslint-disable no-undef */
const bgSyncDispensePlugin = new BackgroundSyncPlugin('reimsDispenseQueue', {
  maxRetentionTime: 30 * 24 * 60 // retry dispense for 30 days
})

const bgSyncEditPlugin = new BackgroundSyncPlugin('reimsEditQueue', {
  maxRetentionTime: 3 * 24 * 60 // retry dispense for 3 days
})

const statusPlugin = {
  fetchDidSucceed: ({ response }) => {
    if (response.status >= 500) {
      // Throwing anything here will trigger fetchDidFail.
      throw new Error('Server error.')
    }
    // If it's not 5xx, use the response as-is.
    return response
  }
}

workbox.routing.registerRoute(
  /\/api\/glasses\/dispense(\/[^/]+){2}\/?/,
  new workbox.strategies.NetworkOnly({
    plugins: [
      statusPlugin,
      bgSyncDispensePlugin
    ]
  }),
  'PUT'
)

workbox.routing.registerRoute(
  /\/api\/glasses\/undispense\/?/,
  new workbox.strategies.NetworkOnly({
    plugins: [
      statusPlugin,
      bgSyncDispensePlugin
    ]
  }),
  'POST'
)

workbox.routing.registerRoute(
  /\/api\/glasses(\/[^/]+){2}\/?/,
  new workbox.strategies.NetworkOnly({
    plugins: [
      statusPlugin,
      bgSyncEditPlugin
    ]
  }),
  'PUT'
)
