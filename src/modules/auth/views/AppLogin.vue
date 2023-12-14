<template>
  <div class="login-container">
    <form class="login-form form-focus" v-if="!showOTP">
      <h2 class="text-center mb-4 display-6">Login</h2>
      <br />
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          v-model="email"
          type="text"
          id="email"
          class="form-control"
          placeholder="Enter your email"
          @input="() => validateForm('email')"
        />
        <p class="error-text">{{ emailError }}</p>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input
          v-model="password"
          type="password"
          id="password"
          class="form-control"
          placeholder="Enter your password"
          @input="() => validateForm('password')"
        />
        <p class="error-text">{{ passwordError }}</p>
      </div>
      <p v-if="serverError" class="error-text">{{ serverError }}</p>
      <div class="d-flex align-items-center mb-3">
        <button @click="login" class="btn btn-primary">Login</button>
        <p class="forgot-text">
          <router-link to="/forgot-pass" class="signup-link"
            >Forgot password ?</router-link
          >
        </p>
      </div>
      <div>
        <p>
          Not a member?
          <router-link to="/signup" class="signup-link">Register</router-link>
        </p>
      </div>
      <hr />
      <GoogleSignInVue />
    </form>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import {
  validateField,
  serverError,
  setErrorMessage,
} from "@/helpers/validation";

import GoogleSignInVue from "./GoogleSignIn.vue";
const store = useStore();
const router = useRouter();

const email = ref("");
const password = ref("");

const emailError = ref("");
const passwordError = ref("");

const login = async () => {
  event.preventDefault();
  validateForm();
  if (emailError.value || passwordError.value) {
    return;
  }

  try {
    const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    if (response.ok) {
      store.commit("setIsMFAFromLogin", true);
      store.commit("setEmail", email.value);
      router.push("/mfa-verify");
    } else {
      const data = await response.json();
      setErrorMessage(data.error) || "Login failed";
    }
  } catch (error) {
    setErrorMessage("Login failed");
  }
};

// Validation
const validateForm = (fieldName = null) => {
  if (fieldName) {
    switch (fieldName) {
      case "email":
        emailError.value = validateField(email.value, "email");
        break;
      case "password":
        passwordError.value = validateField(password.value, "password");
        break;
      default:
        break;
    }
  } else {
    emailError.value = validateField(email.value, "email");
    passwordError.value = validateField(password.value, "password");
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
  emailError.value = "";
  passwordError.value = "";
  setErrorMessage("");
};
</script>

<style scoped>
@import "@/assets/styles/style.scss";

.forgot-text {
  margin-left: 100px;
  margin-top: 10px;
}
.btn-google {
  border: 1px solid rgb(190, 190, 190);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
}
.btn-google:hover {
  background-color: rgb(
    231,
    229,
    229
  ); /* Change this to the desired hover color */
}
img {
  height: 30px;
  width: 30px;
  margin-right: 5px;
}
</style>
