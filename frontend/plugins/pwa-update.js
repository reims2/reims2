
// https://github.com/nuxt-community/pwa-module/issues/239#issuecomment-796807081
export default async() => {
  const workbox = await window.$workbox

  if (!workbox) {
    console.debug("Workbox couldn't be loaded.")
    return
  }

  workbox.addEventListener('installed', (event) => {
    if (!event.isUpdate) return

    console.debug('Update for the PWA available, reloading the page...')
    window.location.reload()
  })
}
