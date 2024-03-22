<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { Logger } from "./utils/common";

import type { AxiosResponse } from "axios";
import type { Ref } from "vue";

const logger : Logger = new Logger({ context: "App.vue", enabled: true});

const message: Ref<string> = ref("Backend is offline :(");
const backendHost: string = "http://localhost";
const backendPort: string = "3000";
const backendURL: string = `${backendHost}:${backendPort}`;
const POLLING_INTERVAL: number = 5000;
const checkBackendHealth = async (): Promise<void> => {
  logger.log("Checking backend health");
  axios
    .get(`${backendURL}/health`)
    .then((response: AxiosResponse) =>
      response.status == 200
        ? (message.value = "Backend is online :)")
        : (message.value = "Backend is offline :(")
    )
    .catch((error: Error) => (message.value = "Backend is offline :("));
};
const pollingHealth = (): void => {
  checkBackendHealth();
  setInterval(() => {
    checkBackendHealth();
  }, POLLING_INTERVAL);
};
pollingHealth();
</script>

<template>
  <header>
    <h1>Hello World</h1>
    <h3>{{ message }}</h3>
  </header>
</template>

<style scoped>
</style>
