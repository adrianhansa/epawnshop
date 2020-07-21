<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarTogglerDemo01"
      aria-controls="navbarTogglerDemo01"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
      <router-link class="navbar-brand" to="/">{{ user ? user.company_name:'ePawnshop'}}</router-link>
      <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
        <template v-if="!user">
          <li class="nav-item">
            <button
              type="button"
              class="btn btn-primary"
              data-toggle="modal"
              data-target="#loginModal"
            >Login</button>
          </li>
          <li class="nav-item">
            <button
              type="button"
              class="btn btn-primary"
              data-toggle="modal"
              data-target="#registerModal"
            >Register</button>
          </li>
        </template>

        <template v-else>
          <li class="nav-item">
            <a href="#" class="nav-link">{{ user.email }}</a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" @click.prevent="logout">Logout</a>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script>
import { fb, db } from "../../firebase/init";
// import { mapGetters } from "vuex";

export default {
  name: "Navbar",
  data() {
    return {
      user: null
    };
  },
  computed: {
    company() {
      if (fb.auth().currentUser) {
        return this.$store.getters.user.company_name;
      }
    }
  },
  methods: {
    showRegister() {
      this.$modal.show("register");
    },
    showLogin() {
      this.$modal.show("login");
    },
    logout() {
      fb.auth()
        .signOut()
        .then(() => {
          this.$router.push({ name: "home" });
        });
    }
  },
  created() {
    fb.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = fb.auth().currentUser;
        this.$store.dispatch("user");
      } else {
        this.user = null;
      }
    });
  }
};
</script>

<style scoped lang="scss">
@media (min-width: 992px) {
  .navbar.custom-nav {
    padding-top: 16px;
    padding-bottom: 16px;
    background-color: #fff !important;
  }
}
</style>