<script setup >
import { ref, watch } from "vue";
import { socket, state } from "../socket.js";

const messageToSend = ref("");
const vsCodeText = ref("");
// Nachricht senden
function sendMessage(msg) {
    socket.emit("messageFromClient",msg);
}

socket.on("messageToClient", (msg) => {
  vsCodeText.value = msg;
  console.log("Message from VsCode: ", msg);
});

watch(() => vsCodeText.value, (newVal) => {
  console.log("New Value: ", newVal);
  sendMessage(vsCodeText.value)
});
</script>


<template>
  <div>
    <h3>
      Socket Verbindungsstatus: {{ state.connected ? "Verbunden" : "Getrennt" }}
    </h3>
    <div>
      <h1>Text aus VsCode:</h1>
      <input v-model="vsCodeText" type="text" />
    </div>
  </div>
</template>

