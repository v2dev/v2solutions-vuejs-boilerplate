<template>
  <div class="app-container">
    <AppSidebar />
    <div class="content-container">
      <router-view />
    </div>
  </div>
  <AppFooter />
</template>

<script setup>
import AppFooter from "./components/AppFooter.vue";
import AppSidebar from "./components/AppSidebar.vue";
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
}

.content-container {
  flex: 1;
  padding: 20px;
}

.sidebar {
  width: 15%;
  min-width: 250px;
  background-color: #333;
  color: #fff;
  padding: 20px;
}

.sidebar img {
  max-width: 100%;
}

.header {
  background-color: #333;
  color: #fff;
  padding: 10px;
}

/* Add more styles as needed */
</style>
