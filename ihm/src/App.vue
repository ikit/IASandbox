<template>
  <v-app>
    <!-- <v-system-bar>
      <v-spacer></v-spacer>
      <v-icon>mdi-square</v-icon>
      <v-icon>mdi-circle</v-icon>
      <v-icon>mdi-triangle</v-icon>
    </v-system-bar> -->

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>
        <a href="/">IA Sandbox</a>
      </v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list-item
        title="Intelligences artificielles"
        subtitle="Langchain ts"
      ></v-list-item>
      <v-divider></v-divider>
      <v-list-item
        link
        prepend-icon="mdi-web"
        href="/rag-wiki"
        title="RAG P-Zelda (OpenAI)"
      ></v-list-item>
      <v-list-item
        link
        prepend-icon="mdi-file"
        href="/rag-pdf"
        title="RAG (pdf)"
      ></v-list-item>
      <v-list-item
        link
        prepend-icon="mdi-microphone"
        href="/stt-tts"
        title="STT > TTS"
      ></v-list-item>
      <v-list-item
        link
        prepend-icon="mdi-database"
        href="/tabular-query"
        title="Tabular query"
      ></v-list-item>
    </v-navigation-drawer>

    <v-main>
      <router-view  style="background: rgb(219, 238, 255)"/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",

  data() {
    return {
      drawer: false,
    };
  },
});
</script>
