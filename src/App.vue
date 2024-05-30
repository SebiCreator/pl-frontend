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
    "topic": "Java Grundlagen verstehen",
    "focus": ["Programmierung", "Entwurfsmuster", "Testen"],
    "subgoals": [
        {
            "topic": "Java lernen",
            "testSummary": "Alle Java-Übungen und Projekte abgeschlossen.",
            "description": "Grundlagen von Java gelernt und ein einfaches Programm erstellt.",
            "done": true,
            "lastChanged": "2024-05-10T00:00:00.000Z",
            "level": 2
        },
        {
            "topic": "Entwurfsmuster studieren",
            "testSummary": "Factory- und Singleton-Muster verstanden.",
            "description": "Factory- und Singleton-Muster studiert und in einem Projekt implementiert.",
            "done": false,
            "lastChanged": "2024-05-10T00:00:00.000Z",
            "level": 3
        },
        {
            "topic": "Unit-Tests implementieren",
            "testSummary": "Unit-Tests für alle neuen Module erstellt.",
            "description": "Unit-Tests für alle neuen Module implementiert.",
            "done": false,
            "lastChanged": "2024-05-10T00:00:00.000Z",
            "level": 1
        }
    ],
    "done": false,
    "lastChanged": "2024-05-10T00:00:00.000Z"
}



const dataStore = useUserDataStore();

const onLoad = async () => {
  await dataStore.setGoal(exampleGoal);
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
