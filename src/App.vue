<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { Logger } from "./utils/common";
import type { Ref } from "vue";
import NavbarLoggedIn from "./components/NavbarLoggedIn.vue";
import { useUserDataStore } from "@/store/userDataStore.js";

const dataStore = useUserDataStore();

const onLoad = async () => {
  await dataStore.loadAll({ email : "test@test.de"})
  console.log("App loaded");
};

onMounted(onLoad);
</script>

<template>
  <header>
    <NavbarLoggedIn />
    <router-view></router-view>
  </header>
</template>

<style scoped>
</style>
