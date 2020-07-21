import Vue from "vue";
import Vuex from "vuex";
import { isContext } from "vm";
import { db, fb } from "./firebase/init";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {}
  },
  getters: {
    user: state => state.user
  },
  mutations: {
    setUser(state) {
      //retrieve the current user in the employees collection
      db.collection("employees")
        .doc(fb.auth().currentUser.email)
        .get()
        .then(doc => {
          if (doc.exists) {
            state.user = doc.data();
            state.user.id = doc.id;
          }
        });
    }
  },
  actions: {
    user(context) {
      context.commit("setUser");
    }
  }
});
