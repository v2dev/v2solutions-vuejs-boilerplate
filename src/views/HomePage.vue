<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="text-center">
          <h1 class="mb-4">Welcome to the Home Page</h1>
          <hr />
          <div v-if="store.state.isLoggedIn" class="logged-in-message">
            <h2>Logged in successfully</h2>
          </div>
          <div v-else class="not-logged-in-message">
            <h2>Please login first</h2>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";

const store = useStore();
</script>

<style scoped>
.container {
  font-family: "Arial", sans-serif;
}

.text-center {
  margin-top: 20px;
}

.logged-in-message {
  margin-top: 20px;
  color: green;
}

.not-logged-in-message {
  margin-top: 20px;
  color: red;
}

h1 {
  font-size: 2.5rem;
}

h2 {
  font-size: 1.8rem;
}
</style>
