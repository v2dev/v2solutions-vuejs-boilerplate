import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vue3GoogleLogin from "vue3-google-login";
import "bootstrap/dist/css/bootstrap.css";

const VUE_APP_GOOGLE_CLIENT_ID =
  "1043028769339-8g0h1iv15tqnf9g54h79vk2j63u42vsk.apps.googleusercontent.com";

createApp(App)
  .use(router)
  .use(store)
  .use(vue3GoogleLogin, {
    clientId: VUE_APP_GOOGLE_CLIENT_ID,
  })
  .mount("#app");

// const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// createApp(App)
//   .use(router)
//   .use(store)
//   .use(vue3GoogleLogin, {
//     clientId: clientId,
//   })
//   .mount("#app");
