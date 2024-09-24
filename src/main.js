import Vue from 'vue'
import App from './App.vue'
import './assets/global.css'
import 'modern-normalize/modern-normalize.css'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
