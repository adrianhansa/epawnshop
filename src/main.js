import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueChatScroll from "vue-chat-scroll";
import VModal from "vue-js-modal";
import { fb } from "./firebase/init";
import "popper.js";
import jQuery from "jquery";
import "bootstrap";
import Vuelidate from "vuelidate";
Vue.use(Vuelidate);

import SmartTable from 'vuejs-smart-table'
Vue.use(SmartTable)

import "sweetalert2/src/sweetalert2.scss";

window.$ = window.jQuery = jQuery;

Vue.use(VModal, { dynamic: true, injectModalsContainer: true });
Vue.use(VueChatScroll);

import "./assets/app.scss";
Vue.component("Navbar", require("./components/layout/Navbar.vue").default);
Vue.config.productionTip = false;

import { format, fromUnixTime } from "date-fns";
Vue.filter("date", (date) => {
  if (!date) return ''
  return format(fromUnixTime(date), 'PPP');
})


Vue.component("DatePicker", require("vue2-datepicker").default);
import "vue2-datepicker/scss/index.scss"

let app = null;

fb.auth().onAuthStateChanged(user => {
  if (!app) {
    app = new Vue({
      data: {
        format, fromUnixTime
      },
      router,
      store,
      render: h => h(App)
    }).$mount("#app");
  }
});
