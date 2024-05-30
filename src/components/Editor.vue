<script setup>
import { ref } from "vue";
import Codemirror from "codemirror-editor-vue3";
import { socket, state } from "../socket.js";

// placeholder
import "codemirror/addon/display/placeholder.js";

// language
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/python/python.js";
import "codemirror/mode/yaml/yaml.js";
// placeholder
import "codemirror/addon/display/placeholder.js";
// theme
import "codemirror/theme/dracula.css";

const props = defineProps({ code: String, lang: String, vsCodeSync: Boolean });
const emit = defineEmits(["change"]);

const code = ref(props.code);
const lang = ref("python");
const vsCodeSync = ref(props.vsCodeSync);



const send = () => {
  socket.emit("messageFromClient", code.value);
};
const change = (newCode) => {
  emit("change", newCode);
};

socket.on("messageToClient", (msg) => {
  console.log("Message from Server: ", msg);
  if(!vsCodeSync) return;
  code.value = msg;
  console.log("Message from VsCode: ", msg);
});


const cmOptions = {
  mode: lang,
  theme: "dracula",
  lineNumbers: true,
  lineWrapping: true,
  placeholder: "Type your code here...",
};
</script>



<template>
  <div class="flex flex-row border rounded-lg">
      <CodeEditor
        v-model:value="code"
        :options="cmOptions"
        border
        :height="600"
        @change="change"
      />

  </div>
</template>