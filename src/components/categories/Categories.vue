<template>
  <div class="categories">
    <AddCategory />
    <EditCategory />
    <template v-if="categories.length">
      <h2>
        Categories
        <a href="#" @click.prevent="$modal.show('addCategory')">
          <i class="fas fa-plus"></i>
        </a>
      </h2>
      <table class="table table-striped table-responsive">
        <thead>
          <th>Category name</th>
          <th>Modify</th>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.name }}</td>
            <td>
              <button
                class="btn btn-sm btn-success"
                @click.prevent="$modal.show('editCategory',{category:category})"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger ml-1" @click.prevent="del(category.id)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
    <template v-else>
      <p>
        You don't have any category define yet.
        <a
          href="#"
          @click.prevent="$modal.show('addCategory')"
        >Start adding</a> them now.
      </p>
    </template>
  </div>
</template>

<script>
import { fb, db } from "@/firebase/init";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";
import Swal from "sweetalert2/dist/sweetalert2.js";

export default {
  name: "Categories",
  data() {
    return {
      categories: []
    };
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
          db.collection("categories")
            .doc(id)
            .delete();
          // Swal.fire("Deleted!", "Your file has been deleted.", "success");
        }
      });
    }
  },
  components: {
    AddCategory,
    EditCategory
  },
  created() {
    db.collection("employees")
      .doc(fb.auth().currentUser.email)
      .get()
      .then(doc => {
        //get the categories by company_id and listen to any changes
        db.collection("categories")
          .where("company_id", "==", doc.data().company_id)
          .onSnapshot(snapshot => {
            this.categories = [];
            snapshot.forEach(doc => {
              let category = doc.data();
              category.id = doc.id;
              this.categories.push(category);
            });
          });
      });
  }
};
</script>