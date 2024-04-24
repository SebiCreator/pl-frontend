<script setup>
import { ref } from "vue";
const activeMenu = ref()
const active = (value) => {
    switch(value){
        case 1:
            activeMenu.value = "Persönliche Einstellungen"
            break;
        case 2:
            activeMenu.value = "Account Einstellungen"
            break;
        case 3:
            activeMenu.value = "Lern Einstellungen"
            break;
        case 4:
            activeMenu.value = "App Einstellungen"
            break;
    }
}
</script>
<template>
    <div class="drawer lg:drawer-open">
  <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content flex flex-col items-center justify-center">
    <label for="my-drawer-2" class="btn btn-primary drawer-button lg:hidden">Menü öffnen</label>
    {{ activeMenu }}
  
  </div> 
  <div class="drawer-side">
    <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label> 
    <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
      <li><a @click="active(1)">Persönliche Einstellungen</a></li>
      <li><a @click="active(2)">Account Einstellungen</a></li>
      <li><a @click="active(3)">Lern Einstellungen</a></li>
      <li><a @click="active(4)">App Einstellungen</a></li>
    </ul>
  
  </div>
</div>
</template>