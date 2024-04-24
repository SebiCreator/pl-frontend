
<script setup>
// TODO : implement chat bubble color from settings
import { ref } from "vue";


const userInput = ref("")
const submit = ( ) => {
    const newMessage =  userInput.value
    if (newMessage) {
      chatConversation.value.push({
        message: newMessage,
        position: "end",
      })
      userInput.value = ""
    }
}

const llmResponse = (input) => {

}



const chatConversation = ref([
  {
    message: "It's over Anakin, I have the high ground.",
    position: "start",
  },
  {
    message: "You underestimate my power!",
    position: "end",
  },
  {
    message: "Don't try it.",
    position: "start",
  },
  {
    message: "what the hell",
    position: "end",
  }
])


</script>
<template>
  <div class="flex flex-col items-center mt-5 mx-auto w-6/12" @keyup.enter="submit">
    <div class="flex flex-row justify-between w-full mb-5 pb-5 border-b border-b-black">
      <input
        type="text"
        placeholder="Type here"
        class="input input-bordered w-full max-w-xs"
        v-model="userInput"
      />
      <button class="btn" @click="submit" >Submit</button>
    </div>
    <div class="w-full">
      <div v-for="statement in chatConversation" :key="statement.message" :class="`chat ${statement.position === 'start' ? 'chat-start' : 'chat-end'}`">
        <div :class="`chat-bubble ${statement.position === 'start' ? 'bg-amber-800' : 'chat-end'}`">
          {{statement.message}}
        </div>
    </div>
  </div>
  </div>
</template>