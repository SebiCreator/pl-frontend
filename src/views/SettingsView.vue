<script setup>
import Editor from "../components/Editor.vue";
import UserDataInputs from "../components/UserDataInputs.vue";
import { ref } from "vue";
const code = ref("");
const lang = ref("javascript");
</script>
<template>
<UserDataInputs/>
</template>