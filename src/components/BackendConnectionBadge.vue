<script setup>
import { ref } from "vue";
import { state, socket } from "../socket";
import axios from "axios";
const apiIsAlive = ref(false);
const wsIsAlive = ref(false);

const backendURL = "http://localhost:3000/health";

const checkBackendConnection = async () => {
  try {
    await axios.get(backendURL);
    apiIsAlive.value = true;
  } catch (error) {
    apiIsAlive.value = false;
  }
};

const checkWSConnection = () => {
  if (state.connected) {
    wsIsAlive.value = true;
  } else {
    wsIsAlive.value = false;
  }
};

const sendMessage = () => {
  socket.emit("ChangeMessage", "Hello from Vue");
  console.log("sending message")
}

setTimeout(checkBackendConnection, 1000);
setTimeout(checkWSConnection, 1000);
</script>



<template>
  <div>
    <div v-if="apiIsAlive" class="badge badge-success gap-2">
      Rest API Verbunden
    </div>
    <div v-if="wsIsAlive" class="badge badge-success gap-2">WS API Verbunden</div>
    <div v-if="!apiIsAlive" class="badge badge-error gap-2">Rest API Nicht verbunden</div>
    <div v-if="!wsIsAlive" class="badge badge-error gap-2">WS API Nicht verbunden</div>
  </div>
</template>

