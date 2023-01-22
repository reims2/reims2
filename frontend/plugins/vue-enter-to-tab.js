import Vue from 'vue'
import VueEnterToTab from 'vue-enter-to-tab'

Vue.use(VueEnterToTab, true)

// source from https://github.com/ajomuch92/vue-enter-to-tab
// it has been modified to 1. include https://github.com/ajomuch92/vue-enter-to-tab/pull/2
// and 2. to auto click a button if the next element is a button
const ENTER_CODE = 13
export const ModifiedEnterToTabMixin = {
  mounted() {
    this.$el.addEventListener('keydown', this.$keyDownEventHandler)
  },
  beforeDestroy() {
    this.$el.removeEventListener('keydown', this.$keyDownEventHandler)
  },
  methods: {
    $keyDownEventHandler(e) {
      const { target, ctrlKey, keyCode } = e
      if (keyCode === ENTER_CODE &&
            !ctrlKey &&
            target &&
            target.tagName.toLowerCase() !== 'textarea' &&
            this.$isEnterToTabEnabled &&
            !target.preventEnterTab) {
        e.preventDefault()
        const allElementsQuery = this.$el.querySelectorAll('input, button, a, textarea, select, audio, video, [contenteditable]')
        const allElements = [...allElementsQuery].filter(r => !r.disabled && !r.hidden && r.offsetParent && !r.readOnly && r.tabIndex >= 0)
        const currentIndex = [...allElements].indexOf(target)
        const targetIndex = (currentIndex + 1) % allElements.length
        const nextElement = allElements[targetIndex]
        nextElement.focus()
        // if the next element is a button, click on it instead of just focusing. otherwise user has to double enter for a button to activate
        if (nextElement.tagName.toLowerCase() === 'button') nextElement.click()
      }
    }
  }
}
