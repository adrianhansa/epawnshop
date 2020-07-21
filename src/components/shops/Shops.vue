<template>
  <div class="shops">
    <h2>
      {{ user.company_name }} Company
      <button
        @click.prevent="$modal.show('addShop')"
        class="btn btn-sm btn-primary"
      >
        <i class="fas fa-plus"></i>
      </button>
    </h2>
    <AddShop />
    <EditShop />
    <table class="table table-striped">
      <thead class="bg-primary text-white">
        <th>Shop name</th>
        <th>Address</th>
        <th>Created at</th>
        <th>Updated at</th>
        <th>Modify</th>
      </thead>
      <tbody>
        <tr v-for="shop in shops" :key="shop.id">
          <td>{{ shop.name }}</td>
          <td>{{ shop.address }}</td>
          <td>{{ shop.created_at | date }}</td>
          <td>{{ shop.updated_at | date }}</td>
          <td>
            <button
              class="btn btn-sm btn-success"
              @click.prevent="$modal.show('editShop',{shop:shop})"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger ml-1" @click.prevent="del(shop.id)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { db, fb } from "@/firebase/init";
import Swal from "sweetalert2/dist/sweetalert2.js";
import { mapGetters } from "vuex";
import AddShop from "./AddShop";
import EditShop from "./EditShop";

export default {
  name: "Shops",
  components: { AddShop, EditShop },
  data() {
    return {
      shops: []
    };
  },
  computed: {
    ...mapGetters(["user"])
  },
  methods: {
    del(id) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(result => {
        if (result.value) {
          db.collection("shops")
            .doc(id)
            .delete();
          // Swal.fire("Deleted!", "Your file has been deleted.", "success");
        }
      });
    }
  },
  created() {
    db.collection("employees")
      .doc(fb.auth().currentUser.email)
      .get()
      .then(doc => {
        if (doc.data().admin) {
          db.collection("shops")
            .where("company_id", "==", doc.data().company_id)
            .onSnapshot(queryChanges => {
              this.shops = [];
              queryChanges.forEach(doc => {
                let shop = doc.data();
                shop.id = doc.id;
                this.shops.push(shop);
              });
            });
        }
      });
    this.$store.dispatch("user");
  }
};
</script>

<style>
</style>