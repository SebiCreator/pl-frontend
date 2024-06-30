<script setup>
import UserDataInputs from "../components/UserDataInputs.vue";
import { ref } from "vue";
</script>
<template>
  <div>
    <div class="flex flex-col items-center">
      <h1 class="text-2xl font-bold mb-6">Einstellungen</h1>
      <h2>Verändere hier die Einstellungen</h2>
    </div>
    <UserDataInputs />
  </div>
</template>