<template>
  <div
    class="modal fade"
    id="registerModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="exampleModalCenterTitle"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalCenterTitle">Register</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <input
              type="text"
              class="form-control"
              v-model="user.company.name"
              placeholder="Company name"
            />
          </div>
          <div class="form-group">
            <input type="text" class="form-control" v-model="user.name" placeholder="Your name" />
          </div>
          <div class="form-group">
            <input type="email" class="form-control" v-model="user.email" placeholder="Email" />
          </div>
          <div class="form-group">
            <input
              type="password"
              class="form-control"
              v-model="user.password"
              placeholder="Password"
              @keydown.enter="register"
            />
          </div>
          <p v-if="feedback" class="red-text">{{ feedback }}</p>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary" @click.prevent="register">Register</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, fb, functions } from "@/firebase/init";
import slugify from "slugify";

export default {
  name: "Register",
  data() {
    return {
      user: {
        name: null,
        company: {
          name: null,
          slug: null
        },
        email: null,
        password: null,
        slug: null
      },
      feedback: null
    };
  },
  methods: {
    register() {
      if (
        this.user.company.name &&
        this.user.name &&
        this.user.email &&
        this.user.password
      ) {
        this.user.company.slug = slugify(this.user.company.name, {
          lower: true,
          remove: /[$*_+`~#'"-/!?:@,]/g,
          replacement: "-"
        });
        let company = db.collection("companies").doc(this.user.company.slug);
        let employee = db.collection("employees").doc(this.user.email);
        company.get().then(doc => {
          if (doc.exists) {
            this.feedback =
              "This company name already exists. Please choose another one.";
          } else {
            //create new user
            fb.auth()
              .createUserWithEmailAndPassword(
                this.user.email,
                this.user.password
              )
              .then(cred => {
                fb.auth().onAuthStateChanged(user => {
                  company.set({
                    name: this.user.company.name,
                    owner_id: cred.user.uid
                  });

                  //set admin and owner rights with the cloud functions
                  // const owner = functions.httpsCallable("makeAdminAndOwner");
                  // owner({
                  //   email: this.user.email,
                  //   company: this.user.company.slug
                  // }).then(() => {
                  //   console.log("Owner ok");
                  // });

                  employee.set({
                    name: this.user.name,
                    admin: true,
                    owner: true,
                    active: true,
                    user_id: user.uid,
                    company_id: this.user.company.slug
                  });
                });
              })
              .then(() => {
                $("#register").modal("hide");
                // this.$store.dispatch("user");
                this.$router.push({ name: "admin" });
              })
              .catch(err => {
                this.feedback = err.message;
              });
          }
        });
      } else {
        this.feedback = "You must enter all fields.";
      }
    }
  }
};
</script>
<style scoped>
</style>