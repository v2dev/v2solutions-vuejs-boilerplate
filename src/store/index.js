import { createStore } from "vuex";

export default createStore({
  state: {
    isLoggedIn: !localStorage.getItem("token") ? false : true,
    token: localStorage.getItem("token") || null,
    email: "",
    isMFAFromLogin: false,
  },
  mutations: {
    setLoggedIn(state, status) {
      state.isLoggedIn = status;
    },
    setToken(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    setEmail(state, email) {
      state.email = email;
    },
    setIsMFAFromLogin(state, value) {
      state.isMFAFromLogin = value;
    },
  },
});
