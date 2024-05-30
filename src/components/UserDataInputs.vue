<template>
  <div class="max-w-md mx-auto mt-10">
    <h1 class="text-2xl font-bold mb-6">User Registration</h1>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label for="email" class="block font-semibold">Email:</label>
        <input type="email" id="email" v-model="user.email" required class="w-full p-2 border border-gray-300 rounded">
      </div>
      <div>
        <label for="name" class="block font-semibold">Name:</label>
        <input type="text" id="name" v-model="user.name" required class="w-full p-2 border border-gray-300 rounded">
      </div>
      <div>
        <label for="age" class="block font-semibold">Age:</label>
        <input type="number" id="age" v-model.number="user.age" required class="w-full p-2 border border-gray-300 rounded">
      </div>
      <div>
        <label for="motivation" class="block font-semibold">Motivation:</label>
        <textarea id="motivation" v-model="user.motivation" class="w-full p-2 border border-gray-300 rounded"></textarea>
      </div>
      <div>
        <label for="occupation" class="block font-semibold">Occupation:</label>
        <input type="text" id="occupation" v-model="user.occupation" class="w-full p-2 border border-gray-300 rounded">
      </div>
      <div>
        <label for="sex" class="block font-semibold">Sex:</label>
        <select id="sex" v-model="user.sex" class="w-full p-2 border border-gray-300 rounded">
          <option value="">Please select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label for="language" class="block font-semibold">Language:</label>
        <input type="text" id="language" v-model="user.language" class="w-full p-2 border border-gray-300 rounded">
      </div>
      <button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
        Submit
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, toRefs } from 'vue';
import { useUserDataStore } from '@/store/userDataStore';
const dataStore = useUserDataStore();
const user = reactive({
    email: '',
    name: '',
    age: null,
    motivation: '',
    occupation: '',
    sex: '',
    language: ''
});

const submitForm = async () => {
    console.log('Submitting:', user);
    await dataStore.setPersonalData(user);
};

</script>
