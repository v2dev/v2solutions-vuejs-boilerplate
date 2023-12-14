<template>
  <div class="text-center">
    <GoogleLogin :callback="callback" promt />
    <p v-if="serverError" class="error-text">{{ serverError }}</p>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { serverError, setErrorMessage } from "@/helpers/validation";

const router = useRouter();
const store = useStore();

const callback = async (response) => {
  try {
    const jwtTokenGoogle = response.credential;
    const res = await verifyGoogleToken(jwtTokenGoogle);

    if (res && res.jwtToken) {
      store.commit("setToken", res.jwtToken);
      store.commit("setLoggedIn", true);
      localStorage.setItem("jwtToken", res.jwtToken);
      router.push("/emp-manager");
      alert("Logged in successfully!");
    } else {
      setErrorMessage("Verification Failed or JWT Token not received");
    }
  } catch (error) {
    setErrorMessage("Error during Google token verification:", error);
  }
};

const verifyGoogleToken = async (token) => {
  try {
    const response = await fetch(
      `${process.env.VUE_APP_API_BASE_URL}/verify-google-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );

    const data = await response.json();
    console.log("Verification API Response:", data);
    return data;
  } catch (error) {
    console.error("Error verifying Google token:", error);
    throw error;
  }
};
</script>

<style></style>
