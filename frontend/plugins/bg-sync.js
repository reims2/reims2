/* eslint-disable no-undef */
const bgSyncPlugin = new BackgroundSyncPlugin('reimsDispenseQueue', {
  maxRetentionTime: 7 * 24 * 60 // retry dispense for 7 days
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
  /\/api\/glasses\/dispense\/.*/,
  new workbox.strategies.NetworkOnly({
    plugins: [
      statusPlugin,
      bgSyncPlugin
    ]
  }),
  'PUT'
)

workbox.routing.registerRoute(
  /\/api\/glasses\/undispense.*/,
  new workbox.strategies.NetworkOnly({
    plugins: [
      statusPlugin,
      bgSyncPlugin
    ]
  }),
  'POST'
)
