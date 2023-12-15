<template>
  <div class="login-container">
    <form
      class="login-form form-focus"
      @submit.prevent="submitVerificationCode"
    >
      <h2 class="mb-4 display-6">Forgot Password?</h2>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          v-model="email"
          type="text"
          id="email"
          class="form-control"
          placeholder="Enter your email"
          @input="validateForm"
        />
        <p class="error-text">{{ emailError }}</p>
      </div>
      <p v-if="serverError" class="error-text">{{ serverError }}</p>
      <div class="d-flex align-items-center mb-3">
        <button type="submit" class="btn btn-primary">Get reset link</button>
        <p class="forgot-text">
          <router-link to="/login" class="signup-link"
            >Back to Login</router-link
          >
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import {
  validateField,
  serverError,
  setErrorMessage,
} from "@/helpers/validation";
import axios from "axios";

const email = ref("");
const emailError = ref("");
const router = useRouter();

const submitVerificationCode = async () => {
  event.preventDefault();
  validateForm();
  if (emailError.value) {
    return;
  }
  try {
    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/forgot-password`,
      {
        email: email.value,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      const data = response.data;
      if (data.error !== "User not found") {
        alert("Reset link sent to your email");
        router.push("/reset-password");
      } else {
        setErrorMessage(data.error);
      }
    } else {
      console.error("Error:", response.data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Validations
const validateForm = () => {
  emailError.value = validateField(email.value, "email");
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
  emailError.value = "";
  setErrorMessage("");
};
</script>

<style scoped>
.forgot-text {
  margin-left: 110px;
}
</style>
