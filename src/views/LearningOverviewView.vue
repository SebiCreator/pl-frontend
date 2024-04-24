<script setup>
import LearningCard from "@/components/LearningCard.vue";
import { ref } from "vue";





const learningGoals = ref([
  {
    title: "Systemprogrammierung",
    content:
      "Erlange tiefgreifendes Verständnis für Systemprogrammierung. Dieser Kurs vermittelt fortgeschrittene Kenntnisse über Betriebssysteme, Speicherverwaltung und effiziente Programmierung für Systeme.",
  },
  {
    title: "ITSEC",
    content:
      "Erforsche die Welt der IT-Sicherheit in diesem Kurs. Lerne die neuesten Techniken zur Abwehr von Cyberbedrohungen und zum Schutz von Daten und Netzwerken.",
  },
  {
    title: "Rechnernetze",
    content:
      "Entdecke die Grundlagen und fortgeschrittenen Konzepte der Rechnernetze in diesem praxisorientierten Kurs. Erfahre alles über Protokolle, Routing und Netzwerkarchitekturen für eine umfassende Kompetenz.",
  },
  {
    title: "C++ Basics",
    content:
      "Erobere C++ durch praxisnahe Lektionen und umfangreiche Anwendungen. Dieser Kurs bietet einen fundierten Einstieg und fördert ein solides Verständnis der Programmiersprache",
  },
  {
    title: "Java Basics",
    content:
      "Lerne Java von Grund auf mit diesem praxisorientierten Kurs. Meistere die Sprache durch praktische Übungen und Anwendungen für ein fundiertes Verständnis.",
  },
]);
</script>


<template>
  <div>
    <button class="btn mb-5 ml-5">Neues Lernziel</button>
    <div class="flex flex-wrap justify-left">
      <div v-for="goal in learningGoals" :key="goal.title" class="m-4">
        <LearningCard :title="goal.title" :content="goal.content" />
      </div>
    </div>
  </div>
</template>
