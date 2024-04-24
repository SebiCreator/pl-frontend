<script setup>
import { ref } from "vue";
import axios from "axios";
const isAlive = ref(false);

const backendURL = "http://localhost:3000/health";

const checkBackendConnection = async () => {
  try {
    await axios.get(backendURL);
    isAlive.value = true;
  } catch (error) {
    isAlive.value = false;
  }
};

setTimeout(checkBackendConnection, 1000);
</script>



<template>
  <div>
    <div v-if="isAlive" class="badge badge-success gap-2">
      Verbunden
    </div>
    <div v-else class="badge badge-error gap-2">
      Nicht verbunden
    </div>
  </div>
</template>

