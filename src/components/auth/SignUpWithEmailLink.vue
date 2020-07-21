<template>
  <div class="container">
    <div class="row">
      <div class="col-md-4 col-md-offset-4">
        <div class="card">
          <form @submit.prevent="login">
            <div class="card-body">
              <div class="card-title">
                <h4>Login</h4>
              </div>

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
                />
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, fb } from "@/firebase/init";
export default {
  data() {
    return {
      email: null,
      password: null
    };
  },
  methods: {
    login() {
      fb.auth()
        .createUserWithEmailAndPassword(this.email, this.password)
        .then(result => {
          db.collection("employees")
            .doc(this.email)
            .update({ user_id: result.user.uid, active: true })
            .then(() => {
              this.$router.push({ name: admin });
            });
        });
    }
  }
};
</script>