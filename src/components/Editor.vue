<script setup>
import { ref, watch } from "vue";
 import Codemirror from "codemirror-editor-vue3";
import { socket, state } from "../socket.js";

import "codemirror/addon/display/placeholder.js";

import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/python/python.js";
import "codemirror/mode/yaml/yaml.js";
import "codemirror/addon/display/placeholder.js";
import "codemirror/theme/dracula.css";

const props = defineProps({
  code: String,
  lang: String,
  vsCodeSync: Boolean
});
const emit = defineEmits(['update:code', 'change']);

const code = ref(props.code);
const lang = ref(props.lang || 'python');
const vsCodeSync = ref(props.vsCodeSync);

const send = () => {
  socket.emit('messageFromClient', code.value);
};

const change = (newCode) => {
  code.value = newCode;
  emit('update:code', newCode); // Trigger update for v-model
  emit('change', newCode);
};

watch(() => props.code, (newCode) => {
  code.value = newCode;
});

socket.on('messageToClient', (msg) => {
  console.log('Message from Server: ', msg);
  console.log('vsCodeSync: ', vsCodeSync.value);
  if (!vsCodeSync.value) return;
  code.value = msg;
  console.log('Message from VsCode: ', msg);
  emit('update:code', msg); // Ensure sync with parent
});



const cmOptions = {
  mode: lang,
  theme: 'dracula',
  lineNumbers: true,
  lineWrapping: true,
  placeholder: 'Type your code here...'
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