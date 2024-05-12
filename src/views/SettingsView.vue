<script setup>
import Editor from "../components/Editor.vue";
import { ref } from "vue";
const code = ref("");
const lang = ref("javascript");
</script>
<template>
<Editor :code="code" :lang="lang" vsCodeSync />
</template>