<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import VueMarkdown from 'vue-markdown-render'


const src = ref(`
# Hello World
## This is a markdown file
### This is a code block
\`\`\`python
a = 10
\`\`\`
`)






</script>


<template>
  <div class="border">

    <vue-markdown :source="src" >
    </vue-markdown>

  </div>
</template>

