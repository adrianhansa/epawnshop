<template>
  <div class="container">
    <form @submit.prevent="sendMessage">
      <div v-if="!oldMessage" class="form-group" :class="{invalid: $v.selectedEmployees.$error}">
        <label for="to">To:</label>
        <select
          v-model="selectedEmployees"
          multiple
          class="form-control"
          id="to"
          @blur="$v.selectedEmployees.$touch()"
        >
          <template v-for="employee in employees">
            <option
              :key="employee.id"
              :value="employee.id"
            >{{ employee.name }} - Shop: {{ employee.shop_name }}</option>
          </template>
        </select>
        <p
          v-if="$v.selectedEmployees.$error"
          class="text-danger"
        >You have to select at least one employee as the receiver of your message.</p>
      </div>
      <div v-if="!oldMessage" class="form-group" :class="{invalid: $v.message.subject.$error}">
        <label for="subject">Subject</label>
        <input
          type="text"
          id="subject"
          v-model="message.subject"
          class="form-control"
          @blur="$v.message.subject.$touch()"
        />
        <p
          v-if="$v.message.subject.$error"
          class="text-danger"
        >This field is required and should countain at least two characters.</p>
      </div>
      <div class="form-group" :class="{invalid: $v.message.content.$error}">
        <label
          v-if="oldMessage"
          for="content"
        >Reply to {{ oldMessage.from }} on subject: {{ oldMessage.subject }}</label>
        <label for="content" v-else></label>
        <vue-editor v-model="message.content" @blur="$v.message.content.$touch()"></vue-editor>
        <p
          v-if="$v.message.content.$error"
          class="text-danger"
        >This field is required and should countain at least two characters.</p>
      </div>
      <div class="form-group">
        <button
          v-if="!oldMessage"
          type="submit"
          class="btn btn-primary"
          :disabled="$v.$invalid"
        >Send Message</button>
        <button v-else type="submit" class="btn btn-primary">Send Message</button>
        <router-link :to="{name: 'messages'}" class="btn btn-secondary ml-1">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { db, fb } from "@/firebase/init";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { required, minLength } from "vuelidate/lib/validators";
import { VueEditor } from "vue2-editor";

export default {
  name: "SendMessage",
  components: { VueEditor },
  data() {
    return {
      employees: [],
      selectedEmployees: [],
      message: {
        read: false,
        subject: "",
        content: "",
        from: fb.auth().currentUser.email,
        name: "",
        position: "",
        shop: "",
        created_at: Math.floor(Date.now() / 1000)
      },
      oldMessage: null
    };
  },
  validations: {
    selectedEmployees: {
      required
    },
    message: {
      subject: { required, minLength: minLength(2) },
      content: { required, minLength: minLength(2) }
    }
  },
  methods: {
    sendMessage() {
      if (this.oldMessage) {
        //send the reply
        console.log(this.message);
        //employee id of the receiver
        this.message.employee_id = this.oldMessage.from;
        db.collection("messages").add(this.message);
      } else {
        if (this.selectedEmployees.length > 0) {
          this.selectedEmployees.forEach(employee => {
            //employee id of the receiver
            this.message.employee_id = employee;
            db.collection("messages").add(this.message);
          });
        }
      }
      this.$router.push({ name: "messages" });
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Message sent!",
        showConfirmButton: false,
        timer: 1500
      });
    }
  },
  created() {
    //get the information of the previous message if this is a reply and attach the current message at the end after a <hr>
    if (this.$route.params.message) {
      this.oldMessage = this.$route.params.message;
      this.message.subject = this.oldMessage.subject;
      this.message.content += `
        <hr>
        <p>${this.oldMessage.content}</p>
        <strong>From: ${this.oldMessage.name}, ${this.oldMessage.position} @ ${this.oldMessage.shop}</strong>
        <span>Sent at: ${this.oldMessage.created_at}</span>
        
      `;
    }
    //get the name, shop and position of the sender
    db.collection("employees")
      .doc(fb.auth().currentUser.email)
      .get()
      .then(doc => {
        this.message.name = doc.data().name;
        if (doc.data().admin) {
          this.message.position = "Admin";
          this.message.shop = doc.data().company_name;
        } else {
          this.message.position = "Staff";
          db.collection("shops")
            .doc(doc.data().shop_id)
            .get()
            .then(doc => {
              this.message.shop = doc.data().name;
            });
        }
      });

    //get the employees list
    db.collection("employees")
      .doc(fb.auth().currentUser.email)
      .get()
      .then(doc => {
        db.collection("employees")
          .where("company_id", "==", doc.data().company_id)
          .get()
          .then(docs => {
            docs.forEach(doc => {
              let employee = doc.data();
              employee.id = doc.id;
              //if there is an oldMessage then select the employee to whom this message is addressed
              if (this.oldMessage) {
                console.log(this.oldMessage.from);
              }
              if (employee.shop_id) {
                db.collection("shops")
                  .doc(employee.shop_id)
                  .get()
                  .then(doc => {
                    employee.shop_name = doc.data().name;
                    this.employees.push(employee);
                  });
              } else {
                employee.shop_name = doc.data().company_name; //"ADMIN";
                this.employees.push(employee);
              }
            });
          });
      });
  }
};
</script>