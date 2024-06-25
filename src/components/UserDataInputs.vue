<template>
  <div class="max-w-md mx-auto mt-10">
    <h1 class="text-2xl font-bold mb-6">Benutzer Einstellungen</h1>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label for="email" class="block font-semibold">Email:</label>
        <input type="email" id="email" v-model="user.email" required class="input input-bordered w-full">
      </div>
      <div>
        <label for="name" class="block font-semibold">Name:</label>
        <input type="text" id="name" v-model="user.name" required class="input input-bordered w-full">
      </div>
      <div>
        <label for="preferences" class="block font-semibold">Lern-Präferenzen:</label>
        <textarea id="preferences" v-model="preferences" class="textarea textarea-bordered w-full">
        </textarea>
      </div>
      <div>
        <label for="age" class="block font-semibold">Age:</label>
        <input type="number" id="age" v-model.number="user.age" required class="input input-bordered w-full">
      </div>
      <div>
        <label for="motivation" class="block font-semibold">Motivation:</label>
        <textarea id="motivation" v-model="user.motivation" class="textarea textarea-bordered w-full"></textarea>
      </div>
      <div>
        <label for="occupation" class="block font-semibold">Occupation:</label>
        <input type="text" id="occupation" v-model="user.occupation" class="input input-bordered w-full">
      </div>
      <div>
        <label for="sex" class="block font-semibold">Sex:</label>
        <select id="sex" v-model="user.sex" class="select select-bordered w-full">
          <option value="">Please select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label for="language" class="block font-semibold">Language:</label>
        <input type="text" id="language" v-model="user.language" class="input input-bordered w-full">
      </div>
      <button type="submit" class="btn btn-primary w-full">
        Submit
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, toRefs, ref } from 'vue';
import { useUserDataStore } from '@/store/userDataStore';
import { storeToRefs } from 'pinia';
const dataStore = useUserDataStore();
const { userPersonalData, preferences } = storeToRefs(dataStore);
console.log('userPersonalData!!!!!!!:', userPersonalData.value)
console.log('preferences:', preferences.value)





const user = reactive({
    email: userPersonalData.value.email || '',
    name: userPersonalData.value.name || '',
    age: userPersonalData.value.age || -1,
    motivation: userPersonalData.value.motivation || '',
    occupation: userPersonalData.value.occupation || '',
    language: userPersonalData.value.language || 'de',
});



const submitForm = async () => {
    console.log('Submitting:', user);
    console.log('Preferences:', preferences.value);
    await dataStore.setPersonalData(user);
    await dataStore.setPreferences({ newPreferences: preferences.value, email: user.email });
};

</script>
