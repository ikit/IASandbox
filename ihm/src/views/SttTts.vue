<template>
    <v-row style="margin: 10px">
      <v-col>
        <v-card
          class="mx-auto"
          style="margin: 10px"
        >
          <v-img
            class="align-end text-white"
            height="100"
            src="https://imgs.search.brave.com/Fu8S_MP7mUrNK6DkC8vY8ygkyi1zk7FrBrTUDM6I5r4/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9mcmFu/dGljYWxseXNwZWFr/aW5nLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvMjAxOS8wNS9X/ZWJwLm5ldC1yZXNp/emVpbWFnZS0yOS5q/cGc"
            cover
          >
            <v-card-title>Enregistrez votre question</v-card-title>
          </v-img>

          <v-card-text>
            <v-form fast-fail @submit.prevent="submit($event)">
              <v-text-field
                v-model="question"
                label="Votre question"
                :rules="questionRules"
              ></v-text-field>
<!-- 
              <v-text-field
                v-model="lastName"
                label="Last name"
                :rules="lastNameRules"
              ></v-text-field> -->

              <v-btn type="submit" block class="mt-2">Submit</v-btn>
            </v-form>
          </v-card-text>

          <!-- <v-card-actions>
            <v-btn color="orange">
              Share
            </v-btn>

            <v-btn color="orange">
              Explore
            </v-btn>
          </v-card-actions> -->
        </v-card>
      </v-col>

      <!-- -->
      <v-col v-if="answer">
        <v-card
          class="mx-auto"
          style="margin: 10px"
        >
          <v-img
            class="align-end text-white"
            height="100"
            src="https://www.puissance-zelda.com/img/dossiers/23.png"
            cover
          >
            <v-card-title>Réponse de Zeld-IA</v-card-title>
          </v-img>

          <v-card-text>
            <h2>Réponse:</h2>
            <p>{{ answer }}</p>
            <v-divider></v-divider>
            <h2>Sources:</h2>
            <ul>
              <li v-for="s of sources"><a :href="s" target="_blank">{{ s }}</a></li>
            </ul>
          </v-card-text>

          <!-- <v-card-actions>
            <v-btn color="orange">
              Share
            </v-btn>

            <v-btn color="orange">
              Explore
            </v-btn>
          </v-card-actions> -->
        </v-card>

      </v-col>
    </v-row>
    <ul class="links">
      <li>
        <a
          href="https://www.puissance-zelda.com/encyclopedie"
          target="_blank"
          >www.puissance-zelda.com</a
        >
      </li>
      <li>
        <a
          href="https://js.langchain.com/docs/use_cases/rag/code_understanding"
          target="_blank"
          >langchain: RAG overview</a
        >
      </li>
      <li>
        <a
          href="https://js.langchain.com/docs/expression_language/cookbook/retrieval"
          target="_blank"
          >langchain: RAG</a
        >
      </li>
    </ul>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { parseAxiosResponse } from "../common/helper";
import axios from "axios";

export default defineComponent({
  data: vm => ({
    loading: false,
    question: '',
    questionRules: [
      (value: string) => {
        if (value && value.trim().length > 0) return true
        return 'Pose ta question bordel'
      },
    ],
    answer: '',
    sources: []
  }),
  methods: {
      async submit (event: any) {
        this.loading = true
        this.answer = "C'est Zelda !";
      },
    }
});
</script>

<style lang="scss" scoped>
  h2 {
    opacity: 0.5;
    font-size: 14px;
  }

  p {
    margin-bottom: 20px;
    font-style: italic;
  }

  ul {
    margin-left: 20px;
    li {
      list-style-type: circle;
    }
  }

  .links {
    margin-left: 45px;
    font-size: 12px;
    a {
      color: #000;
      text-decoration: none;
    }
  }
</style>