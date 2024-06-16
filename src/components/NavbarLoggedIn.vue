<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import BackendConnectionBadge from "@/components/BackendConnectionBadge.vue";

const showBadge = ref(false);


const router = useRouter()


const goToNewGoal = () => {
  router.push("/newGoal");
}
const goToEinstellungen = () => {
  router.push("/settings");
}
const goToLernen = () => {
  router.push("/overview");
}

const goToLanding = () => {
  router.push("/");
}

const toCodeReview = () => {
  router.push("/codeReview");
}
</script>
<template>
<div class="navbar bg-base-100 mb-10 border">
  <div class="navbar-start">
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
      </div>
      <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        <li>
          <a @click="goToEinstellungen">Einstellungen</a>
        </li>
        <li><a @click="goToLernen">Lernen</a></li>
        <li><a @click="goToNewGoal">Ziel erstellen</a></li>
        <li><a @click="toCodeReview">Code Review</a></li>
      </ul>
    </div>
    <a class="btn btn-ghost text-xl" @click="goToLanding">MyAppLogo</a>
  </div>
  <div class="navbar-center hidden lg:flex justify-around">
    <ul class="menu menu-horizontal px-1 mr-4">
      <li>
          <a @click="goToEinstellungen">Einstellungen</a>
      </li>
      <li><a @click="goToLernen">Lernen</a></li>
      <li><a @click="goToNewGoal">Ziel erstellen</a></li>
      <li><a @click="toCodeReview">Code Review</a></li>
    </ul>
    <BackendConnectionBadge v-if="showBadge"/>
  </div>
  <div class="navbar-end">
    <span class="btn mr-4">Testuser</span>
  </div>
</div>
    
</template>
