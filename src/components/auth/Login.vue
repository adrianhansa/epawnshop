<template>
  <div
    class="modal fade"
    id="loginModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="exampleModalCenterTitle"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalCenterTitle">Login</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <input
              type="email"
              class="form-control"
              name="email"
              v-model="email"
              placeholder="Email"
            />
          </div>
          <div class="form-group">
            <input
              type="password"
              class="form-control"
              name="password"
              v-model="password"
              placeholder="Password"
              @keydown.enter="login"
            />
          </div>
          <p v-if="feedback" class="red-text">{{ feedback }}</p>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary" @click.prevent="login">Login</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fb, db } from "../../firebase/init";
export default {
  name: "Login",
  data() {
    return {
      email: null,
      password: null,
      feedback: null
    };
  },
  methods: {
    login() {
      if (this.email && this.password) {
        fb.auth()
          .signInWithEmailAndPassword(this.email, this.password)
          .then(() => {
            $("#loginModal").modal("hide");
            this.$router.push({ name: "admin" });
          })
          .catch(err => {
            this.feedback = err.message;
          });
      } else {
        this.feedback = "Please complete all fields";
      }
    }
  }
};
</script>

<style>
</style>