<template>
  <div class="message container card">
    <div class="card-body">
      <h5 class="card-title">{{ message.subject }}</h5>
      <p>
        From:
        <strong>{{ message.name }}</strong>
        , ({{ message.position }} - {{ message.shop }})
        <span
          class="ml-2"
        >@ {{ message.created_at|date }}</span>
      </p>
      <p class="card-text" v-html="message.content"></p>
      <hr />
      <router-link :to="{name: 'send-message', params:{message}}" class="btn btn-primary my-1">Reply</router-link>
    </div>
  </div>
</template>

import { db } from "@/firebase/init";

<script>
export default {
  name: "MessageDetails",
  props: ["message"]
};
</script>