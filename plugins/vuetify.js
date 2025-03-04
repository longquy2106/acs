// plugins/vuetify.js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VCalendar } from 'vuetify/labs/VCalendar'

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    ssr: true,
    components: {
      ...components,
      VCalendar, // Thêm VCalendar vào danh sách components
    },
    directives,
  })

  nuxtApp.vueApp.use(vuetify)
})