<script setup>
import { ref } from "vue";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";

const fileContent = ref(null);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    fileContent.value = file;
  }
};

const scanFile = async () => {
  if (fileContent.value) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      console.log({ e })
      const blob = new Blob([e.target.result], {
        type: fileContent.value.type,
      });
      console.log("Blob: ", blob)
      const loader = new WebPDFLoader(blob);
      const docs = await loader.load();
      console.log("Scanning file with Blob: ", blob);
      console.log("docs: ", docs);
    };
    reader.readAsArrayBuffer(fileContent.value);
  }
};
</script>
<template>
  <div>
    <h1>Neues Lernziel</h1>
    <input
      type="file"
      @change="handleFileChange"
      class="file-input file-input-bordered w-full max-w-xs"
    />
    <button class="btn" @click="scanFile">Scannen</button>
  </div>
</template>