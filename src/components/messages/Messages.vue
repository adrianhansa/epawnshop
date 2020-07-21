<template>
  <div class="row">
    <div class="col-12">
      <router-link :to="{name: 'send-message'}" class="btn btn-primary my-1">New Message</router-link>
      <button class="btn btn-primary ml-1" @click.prevent="showSent = false">Inbox</button>
      <button class="btn btn-primary ml-1" @click.prevent="showSent = !showSent">Sent messages</button>
      <!-- <div class="row">
      <div class="col-sm-7">-->
      <template v-if="!showSent">
        <DisplayMessages :messages="messages" />
      </template>
      <template v-else-if="showSent">
        <DisplayMessages :messages="sentMessages" />
      </template>
      <p v-else>You don't have any message yet.</p>
    </div>
  </div>
</template>

<script>
import { fb, db } from "@/firebase/init";
import DisplayMessages from "./DisplayMessages";

export default {
  name: "Messages",
  components: {
    DisplayMessages
  },
  data() {
    return {
      showSent: false,
      messages: [],
      sentMessages: []
    };
  },
  created() {
    //employee_id indicates the receiver of the message
    db.collection("messages")
      .orderBy("created_at", "desc")
      .where("employee_id", "==", fb.auth().currentUser.email)
      .onSnapshot(snapshot => {
        this.messages = [];
        snapshot.forEach(doc => {
          let message = doc.data();
          message.id = doc.id;
          this.messages.push(message);
        });
      });

    //'from' field in 'messages' collection indicates the sender of the message
    db.collection("messages")
      .orderBy("created_at", "desc")
      .where("from", "==", fb.auth().currentUser.email)
      .onSnapshot(snapshot => {
        this.sentMessages = [];
        snapshot.forEach(doc => {
          let message = doc.data();
          message.id = doc.id;
          this.sentMessages.push(message);
        });
      });
  }
};
</script>

<style>
.newMessage {
  color: blue;
}
</style>