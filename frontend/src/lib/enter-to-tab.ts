import { useEventListener } from '@vueuse/core'
import { MaybeRefOrGetter } from 'vue'

// source from https://github.com/ajomuch92/vue-enter-to-tab
// it has been modified to 1. to auto click a button if the next element is a button
// 2. to use the composable API
// 3. to use vueuse with useEventListener for automatically removing event listeners

type HTMLElementWithPrevent = HTMLElement & { preventEnterTab?: boolean }

export const useEnterToTab = (
  element: MaybeRefOrGetter<HTMLElement | null | undefined>,
  { autoClickButton = true } = {},
) => {
  const isEnterToTabEnabled = ref(true)

  useEventListener(element, 'keydown', async (e: KeyboardEvent) => {
    const { ctrlKey, code, altKey, shiftKey } = e
    const target = e.target as HTMLElementWithPrevent
    if (
      code === 'Enter' &&
      !ctrlKey &&
      !altKey &&
      !shiftKey &&
      target &&
      target.tagName.toLowerCase() !== 'textarea' &&
      isEnterToTabEnabled &&
      !target.preventEnterTab
    ) {
      e.preventDefault()
      const elementValue = toValue(element)
      if (elementValue === null || elementValue === undefined) {
        console.warn('cant convert enter to tab, element is null')
        return
      }
      const allElementsQuery = elementValue.querySelectorAll(
        'input, button, a, textarea, select, audio, video, [contenteditable]',
      )

      const allElements: HTMLElement[] = []
      allElementsQuery.forEach((e) => {
        const r = e as HTMLInputElement
        if (!r.disabled && !r.hidden && r.offsetParent && !r.readOnly && r.tabIndex >= 0) {
          allElements.push(r)
        }
      })
      const currentIndex = [...allElements].indexOf(target)
      const targetIndex = (currentIndex + 1) % allElements.length
      const nextElement = allElements[targetIndex]
      nextElement.focus()
      // if the next element is a button, click on it instead of just focusing. otherwise user has to double enter for a button to activate
      if (autoClickButton && nextElement.tagName.toLowerCase() === 'button') {
        // wait so that any changes from unfocusing of old element are considered
        await nextTick()
        nextElement.click()
      }
    }
  })

  const setEnterToTabEnabled = (value: boolean) => {
    isEnterToTabEnabled.value = value
  }

  const vPreventEnterTab = {
    beforeMount: (el: HTMLElementWithPrevent) => (el.preventEnterTab = true),
  }

  return {
    isEnterToTabEnabled,
    vPreventEnterTab,
    setEnterToTabEnabled,
  }
}
