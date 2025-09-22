<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div v-if="token" class="w-full max-w-4xl p-6">
      <Dashboard :token="token" @logout="handleLogout" />
    </div>
    <div v-else class="w-full max-w-md p-6">
      <Login @login="handleLogin" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Login from "@/components/Login.vue";
import Dashboard from "@/components/Dashboard.vue";

const token = ref(null);

onMounted(() => {
  token.value = localStorage.getItem("token");
});

function handleLogin(t) {
  localStorage.setItem("token", t);
  token.value = t;
}

function handleLogout() {
  localStorage.removeItem("token");
  token.value = null;
}
</script>

<style scoped>
/* คุณสามารถเพิ่ม style พิเศษได้ */
</style>
