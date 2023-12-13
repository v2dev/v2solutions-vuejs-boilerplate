import axios from "axios";
import store from "@/store"; // Import your Vuex store

const instance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
});

instance.interceptors.request.use(
  (config) => {
    const token = store.state.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
