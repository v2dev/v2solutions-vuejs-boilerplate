import { createStore } from "vuex";

export default createStore({
  state: {
    isLoggedIn: !localStorage.getItem("jwtToken") ? false : true,
    jwtToken: localStorage.getItem("jwtToken") || null,
    email: "",
    isMFAFromLogin: false,
  },
  mutations: {
    setLoggedIn(state, status) {
      state.isLoggedIn = status;
    },
    setToken(state, jwtToken) {
      state.jwtToken = jwtToken;
      localStorage.setItem("jwtToken", jwtToken);
    },
    setEmail(state, email) {
      state.email = email;
    },
    setIsMFAFromLogin(state, value) {
      state.isMFAFromLogin = value;
    },
  },
});
