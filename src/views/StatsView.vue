<script setup>
import { computed, onBeforeMount } from "vue";
import { mainFunc } from "../utils/chains.js";
import hljs from "highlight.js";
import "highlight.js/styles/default.css"; // You can choose from various styles
import { ref } from "vue";
import CodeEditor from "simple-code-editor";
const showCode = ref("const a = 10 + 20\nconsole.log(a)");


onBeforeMount(async () => {
  /*
  const invokeChain = mainFunc();
  const result = await invokeChain("Classes in Python", "de");
  const { code, programmingLanguage} = result;
  showCode.value = code;
  console.log(result);
  */
 null
});
const submit = () => {
    console.log(showCode.value);
    };
</script>


<template>
  <div>
    <CodeEditor
      :line-nums="true"
      :display-language="false"
      v-model="showCode"
    ></CodeEditor>
    {{ showCode}}
    <button class="btn" @click="submit"></button>
  </div>
</template>