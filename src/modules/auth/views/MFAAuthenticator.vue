<template>
  <div class="signup-form form-focus">
    <h2 class="text-center mb-4 display-6">Verify OTP</h2>
    <div class="mb-3">
      <div class="text-center mb-4" v-if="!store.state.isMFAFromLogin">
        <img :src="qrCode" />
      </div>

      <div class="mb-3">
        <input
          v-model="mfaOTP"
          type="text"
          id="token"
          class="form-control"
          placeholder="Enter your authenticator code"
          @input="validateOTPInput"
        />
        <p class="error-text">{{ mfaOtpError }}</p>
      </div>

      <p v-if="serverError" class="error-text">{{ serverError }}</p>
      <button @click="verify" class="btn btn-primary">Verify</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  validateOTP,
  setErrorMessage,
  serverError,
} from "@/helpers/validation";

import { useStore } from "vuex";
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();

const mfaOTP = ref("");
const mfaOtpError = ref("");

const email = computed(() => store.state.email);

const jwtToken = ref(localStorage.getItem("token") || "");
const qrCode = ref(localStorage.getItem("qrCodeUrl") || "");
const validateOTPInput = () => {
  mfaOtpError.value = validateOTP(mfaOTP.value);
};

const verify = async (event) => {
  event.preventDefault();
  validateOTPInput();
  if (mfaOtpError.value) {
    return;
  }

  try {
    const response = await fetch(
      `${process.env.VUE_APP_API_BASE_URL}/mfa-verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value,
          mfaToken: mfaOTP.value,
        }),
      }
    );

    if (store.state.isMFAFromLogin) {
      if (response.ok) {
        const data = await response.json();
        jwtToken.value = data.jwtToken;
        store.commit("setLoggedIn", true);
        store.commit("setToken", data.jwtToken);
        localStorage.setItem("token", jwtToken.value);

        alert("Logged in successfully!");
        router.push("/emp-manager");
      } else {
        const data = await response.json();
        if (response.status === 401) {
          setErrorMessage("Invalid OTP");
        } else {
          setErrorMessage(data.error || "Login failed");
        }
      }
    } else {
      // Action for other MFA origins
      if (response.ok) {
        alert("Successfully verified");
        // Redirect to appropriate route after MFA verification for signup
        router.push("/login"); // Change this to the appropriate route
      } else {
        console.error("Error verifying:", response.statusText);
        setErrorMessage("Invalid OTP");
      }
    }
  } catch (error) {
    if (store.state.isMFAFromLogin) {
      setErrorMessage("Login failed");
    } else {
      console.error("Error verifying:", error);
      setErrorMessage("Error verifying:", error);
    }
  }

  // Do not reset the flag after performing actions for login
  if (!store.state.isMFAFromLogin) {
    store.commit("setIsMFAFromLogin", false);
  }
};
</script>

<style scoped>
@import "@/assets/styles/style.scss";
.mfa-authenticator {
  width: 500px;
  margin: auto;
}
</style>
