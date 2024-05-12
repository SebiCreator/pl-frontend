<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { Logger } from "./utils/common";
import type { Ref } from "vue";
import NavbarLoggedIn from "./components/NavbarLoggedIn.vue";
import { useUserDataStore } from "@/store/userDataStore.js";

const examplePref = {
  email: "test@test.de",
  summary: "test",
  testTypes: ["Q&A", "Flashcards"],
};
const examplePersonalData = {
  email: "test@test.de",
  name: "Max",
  age: 20,
  motivation: "learning",
  occupation: "student",
};
const exampleGoal = {
    "email": "test@test.de",
    "topic": "Improve Software Development Skills",
    "focus": ["Programming", "Design Patterns", "Testing"],
    "subgoals": [
        {
            "topic": "Learn JavaScript",
            "testSummary": "Completed all JavaScript exercises and projects.",
            "description": "Learned JavaScript basics and created a simple web application.",
            "done": true,
            "lastChanged": "2024-05-10T00:00:00.000Z",
            "level": 2
        },
        {
            "topic": "Study Design Patterns",
            "testSummary": "Understood Factory and Singleton patterns.",
            "description": "Studied Factory and Singleton patterns and implemented them in a project.",
            "done": false,
            "lastChanged": "2024-05-10T00:00:00.000Z",
            "level": 3
        },
        {
            "topic": "Implement Unit Tests",
            "testSummary": "Created unit tests for all new modules.",
            "done": false,
            "lastChanged": "2024-05-10T00:00:00.000Z",
            "description": "Implemented unit tests for all new modules.",
            "level": 1
        }
    ],
    "done": false,
    "lastChanged": "2024-05-10T00:00:00.000Z"
}


const dataStore = useUserDataStore();

const onLoad = async () => {
  await dataStore.loadAll({ email: "test@test.de" });
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
