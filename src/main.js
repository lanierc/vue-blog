import Vue from "vue";
import { Datetime } from "vue-datetime";
import wysiwyg from "vue-wysiwyg";
import vSelect from "vue-select";
import VueMeta from "vue-meta";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "vue-select/dist/vue-select.css";

Vue.use(wysiwyg, {
  image: {
    uploadURL: "/api/image",
    dropzoneOptions: {},
  },
});

Vue.use(VueMeta);

Vue.component("datetime", Datetime);

Vue.component("vue-select", vSelect);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
