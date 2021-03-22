import Vue from 'vue'
import VueDragscroll from 'vue-dragscroll'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'
import '@/assets/main.scss'

Vue.config.productionTip = false
Vue.config.performance = true
Vue.config.devtools = true

Vue.use(VueDragscroll)

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
