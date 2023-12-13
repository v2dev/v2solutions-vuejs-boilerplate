<template>
  <div class="sidebar">
    <router-link to="/">
      <img src="https://www.v2solutions.com/images/v-2-logo.svg" alt="Logo" />
    </router-link>
    <hr />
    <div class="nav-links">
      <p><router-link to="/" class="nav-link">Home</router-link></p>
      <p>
        <router-link to="/emp-manager" class="nav-link">Employees</router-link>
      </p>
      <span v-if="!isLoggedIn">
        <p><router-link to="/login" class="nav-link">Login</router-link></p>
      </span>
      <span v-else>
        <p @click="showLogoutModal" class="nav-link">Logout</p>
      </span>
    </div>

    <!-- Confirmation Modal -->
    <AppModal
      v-if="showModal"
      :title="modalTitle"
      :action="modalAction"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import AppModal from "@/components/AppModal.vue";
const modalTitle = ref("Are you sure you want to logout?");
const modalAction = ref("Logout");
const router = useRouter();

const store = useStore();
const isLoggedIn = computed(() => store.state.isLoggedIn);
const showModal = ref(false);

const showLogoutModal = () => {
  showModal.value = true;
};

const confirmLogout = async () => {
  store.commit("setLoggedIn", false);
  store.commit("setToken", null);
  localStorage.removeItem("token");
  router.push("/");
  showModal.value = false;
};

const cancelLogout = () => {
  showModal.value = false;
};
</script>

<style scoped></style>
