<template>
  <div class="login-container">
    <form class="login-form form-focus" @submit.prevent="resetPassword">
      <h2 class="mb-4 display-6">Reset Password</h2>
      <div class="mb-3" v-if="!tokenProvided">
        <label for="otp" class="form-label">Enter OTP</label>
        <input
          v-model="otp"
          type="text"
          id="otp"
          class="form-control"
          placeholder="Enter OTP"
          @input="() => validateForm('otp')"
        />
        <p class="error-text">{{ otpError }}</p>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">New Password</label>
        <input
          v-model="password"
          type="password"
          id="password"
          class="form-control"
          placeholder="Enter new password"
          @input="() => validateForm('password')"
        />
        <p class="error-text">{{ passwordError }}</p>
      </div>
      <div class="mb-3">
        <label for="confirmPassword" class="form-label"
          >Confirm New Password</label
        >
        <input
          v-model="confirmPassword"
          type="password"
          id="confirmPassword"
          class="form-control"
          placeholder="Confirm new password"
          @input="() => validateForm('confirmPassword')"
        />
        <p class="error-text">{{ confirmPasswordError }}</p>
      </div>
      <p v-if="serverError" class="error-text">{{ serverError }}</p>
      <button type="submit" class="btn btn-primary">Reset Password</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

import {
  validateField,
  serverError,
  setErrorMessage,
} from "@/helpers/validation";

const router = useRouter();

const otp = ref("");
const password = ref("");
const confirmPassword = ref("");
const otpError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");
const resetPassToken = computed(() => router.currentRoute.value.params.token);
const tokenProvided = computed(() => !!resetPassToken.value);

const resetPassword = async () => {
  if (!tokenProvided.value) {
    validateForm(); // Validate form only if OTP is required
    if (otpError.value || passwordError.value || confirmPasswordError.value) {
      return;
    }
  }

  try {
    const requestBody = {
      password: password.value,
      confirmPassword: confirmPassword.value,
    };

    if (!tokenProvided.value) {
      // Include OTP only if token is not provided
      requestBody.otp = otp.value;
    } else {
      requestBody.token = resetPassToken.value;
    }

    const response = await fetch(
      `${process.env.VUE_APP_API_BASE_URL}/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Password reset successfully");
      router.push("/login");
    } else {
      if (data.error === "Invalid or expired OTP") {
        setErrorMessage(data.error);
      } else {
        console.error("Error:", data);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Validations
const validateForm = (fieldName = null) => {
  if (fieldName) {
    switch (fieldName) {
      case "otp":
        otpError.value = validateField(otp.value, "otp");
        break;
      case "password":
        passwordError.value = validateField(password.value, "password");
        break;
      case "confirmPassword":
        confirmPasswordError.value = validateField(
          confirmPassword.value,
          "confirmPassword",
          password.value
        );
        break;
      default:
        break;
    }
  } else {
    otpError.value = validateField(otp.value, "otp");
    passwordError.value = validateField(password.value, "password");
    confirmPasswordError.value = validateField(
      confirmPassword.value,
      "confirmPassword",
      password.value
    );
  }
};

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});

const handleOutsideClick = (event) => {
  const formContainer = document.querySelector(".form-focus");

  if (formContainer && !formContainer.contains(event.target)) {
    clearErrors();
  }
};

const clearErrors = () => {
  passwordError.value = "";
  confirmPasswordError.value = "";
  otpError.value = "";
  setErrorMessage("");
};
</script>

<style scoped>
/* Styles */
.login-container {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}

.error-text {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}
</style>
