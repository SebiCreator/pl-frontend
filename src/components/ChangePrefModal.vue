<script setup>
import { ref } from 'vue';
import { useUserDataStore } from '@/store/userDataStore';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

const router = useRouter();
const dataStore = useUserDataStore();
const { preferences } = storeToRefs(dataStore);


</script>

<template>
  <dialog id="modal1" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Ändere deine Präferenzen</h3>
      <textarea
        v-model="preferences"
        class="w-full p-2 border border-gray-300 rounded"
      ></textarea>
      <div class="flex flex-row">
        <button class="btn mr-3">Speichern</button>
        <button class="btn" @click="router.push('/settings')">
          Einstellungen
        </button>
      </div>
      <div class="modal-action">
        <form method="dialog">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
</template>