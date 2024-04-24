<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { Logger } from "./utils/common";
import type { Ref } from "vue";
import NavbarLoggedIn from "./components/NavbarLoggedIn.vue";
</script>

<template>
  <header>
    <NavbarLoggedIn/>
    <router-view ></router-view>
  </header>
</template>

<style scoped>
</style>
