import Vue from "vue";
import App from "./App.vue";
import SmartTable from 'vuejs-smart-table'
import VTooltip from 'v-tooltip'

Vue.use(SmartTable)
Vue.use(VTooltip)

import './assets/css/main.css'
import 'v-tooltip/dist/v-tooltip.css'

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
