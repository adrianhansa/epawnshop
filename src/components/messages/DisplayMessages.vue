<template>
  <div class="row">
    <div v-if="messages.length" class="col-sm-7">
      <input
        type="text"
        v-model="search"
        class="form-control"
        placeholder="Search messages by sender, subject or any text inside of their content"
      />

      <table class="table messages table-striped">
        <thead>
          <th>From</th>
          <th>Subject</th>
          <th>Received</th>
          <th>Message</th>
          <th>Actions</th>
        </thead>
        <tbody>
          <tr
            v-for="message in filteredMessages"
            :key="message.id"
            :class="{'newMessage': !message.read}"
          >
            <td>{{ message.from }}</td>
            <td>{{ message.subject }}</td>
            <td>{{ message.created_at|date }}</td>
            <td>
              <span
                v-html="message.content.length > 30 ? `${message.content.substr(0,30)} ...`:message.content"
              ></span>
            </td>
            <td>
              <button @click.prevent="displayMessage(message)" class="btn btn-xs btn-success">
                <i v-if="!message.read" class="far fa-envelope"></i>
                <i v-else class="far fa-envelope-open"></i>
              </button>
              <button class="btn btn-danger btn-xs ml-1" @click.prevent="del(message.id)">
                <i class="fas fa-trash-alt" title="Delete this message"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col-sm-5">
      <template v-if="selectedMessage.id">
        <MessageDetails :message="selectedMessage" />
      </template>
    </div>
  </div>
</template>

<script>
import { fb, db } from "@/firebase/init";
import Swal from "sweetalert2/dist/sweetalert2.js";
import MessageDetails from "./MessageDetails";

export default {
  name: "DisplayMessages",
  props: ["messages"],
  components: { MessageDetails },
  computed: {
    filteredMessages() {
      return this.messages.filter(message => {
        return (
          message.from.match(this.search) ||
          message.content.match(this.search) ||
          message.subject.match(this.search)
        );
      });
    }
  },
  data() {
    return {
      selectedMessage: {},
      search: ""
    };
  },
  methods: {
    displayMessage(message) {
      this.selectedMessage = message;
      db.collection("messages")
        .doc(message.id)
        .update({ read: true });
    },
    del(id) {
      Swal.fire({
        title: "Are you sure ?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(result => {
        if (result.value) {
          db.collection("messages")
            .doc(id)
            .delete();
        }
      });
    }
  }
};
</script>