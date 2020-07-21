<template>
  <div class="admin">
    <div class="page-wrapper default-theme sidebar-bg bg1 toggled">
      <a id="show-sidebar" @click="closeMenu" class="btn btn-sm btn-dark" href="#">
        <i class="fas fa-bars"></i>
      </a>
      <nav id="sidebar" class="sidebar-wrapper">
        <div class="sidebar-content">
          <!-- sidebar-brand  -->
          <div class="sidebar-item sidebar-brand">
            <a href="#">{{ user.company_name }}</a>
            <div id="close-sidebar" @click="closeMenu">
              <i class="fas fa-times"></i>
            </div>
          </div>
          <!-- sidebar-header  -->
          <div class="sidebar-item sidebar-header">
            <div class="user-info">
              <span class="user-name">
                <strong>{{ user.id }}, {{ user.admin ? 'admin':'staff' }}</strong>
              </span>
            </div>
          </div>
          <!-- sidebar-menu  -->
          <div class="sidebar-item sidebar-menu">
            <ul>
              <li>
                <router-link :to="{name:'shops'}" v-if="user.admin">
                  <i class="fas fa-store-alt"></i>
                  <span>Shops</span>
                </router-link>
              </li>
              <li>
                <router-link :to="{name:'employees'}" v-if="user.admin">
                  <i class="fas fa-user-friends"></i>
                  <span>Employees</span>
                </router-link>
              </li>
              <li>
                <router-link :to="{name:'categories'}" v-if="user.admin">
                  <i class="fas fa-columns"></i>
                  <span>Categories</span>
                </router-link>
              </li>
              <li>
                <router-link :to="{name: 'customers'}">
                  <i class="fa fa-user"></i>
                  <span>Customers</span>
                </router-link>
              </li>

              <li>
                <router-link :to="{name: 'purchases'}">
                  <i class="fa fa-shopping-cart"></i>
                  <span>Purchases</span>
                </router-link>
              </li>

              <li>
                <router-link :to="{name: 'sales'}">
                  <i class="fa fa-shopping-cart"></i>
                  <span>Sales</span>
                </router-link>
              </li>

              <li>
                <router-link :to="{name: 'returns'}">
                  <i class="fa fa-shopping-cart"></i>
                  <span>Returns</span>
                </router-link>
              </li>
              <hr />
              <li>
                <a href="#" @click="logout()">
                  <i class="fa fa-power-off"></i>
                  <span>Logout</span>
                </a>
              </li>
              <li>
                <router-link :to="{name:'messages'}">
                  <i class="fas fa-inbox"></i>
                  <span>Messages ({{ messages }})</span>
                </router-link>
              </li>
            </ul>
          </div>
          <!-- sidebar-menu  -->
        </div>
      </nav>
      <!-- sidebar-content  -->
      <main class="page-content">
        <!-- <div class="container"> -->
        <div class="row">
          <div class="col-lg-12 col-md-10 col-md-offset-1 col-sm-8 col-sm-offset-2">
            <router-view />
          </div>
        </div>
        <!-- </div> -->
      </main>
      <!-- page-content" -->
    </div>
    <!-- page-wrapper -->
  </div>
</template>

<script>
import { db, fb } from "../firebase/init";
import { mapGetters } from "vuex";
export default {
  name: "Admin",
  computed: {
    ...mapGetters(["user"])
  },
  data() {
    return {
      messages: 0
    };
  },
  methods: {
    closeMenu() {
      $(".page-wrapper").toggleClass("toggled");
    },
    logout() {
      fb.auth()
        .signOut()
        .then(() => {
          this.$router.replace("/");
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  created() {
    //get new messages
    db.collection("messages")
      .where("employee_id", "==", fb.auth().currentUser.email)
      .where("read", "==", false)
      .onSnapshot(snapshot => {
        this.messages = 0;
        snapshot.forEach(doc => {
          this.messages++;
        });
      });
  },
  mounted() {
    this.$store.dispatch("user");
  }
};
</script>

<style>
</style>
