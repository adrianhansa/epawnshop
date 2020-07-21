<template>
  <modal name="addCategory" :height="350">
    <div class="card">
      <div class="card-header">
        <h4>Add Category</h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="addCategory">
          <div class="form-group" :class="{invalid: $v.category.name.$error}">
            <label for="name">Category name:</label>
            <input
              type="text"
              class="form-control"
              v-model="category.name"
              autofocus
              @blur="$v.category.name.$touch()"
            />
            <p
              v-if="$v.category.name.$error"
              class="text-danger"
            >This field is required and it must contain at least two characters.</p>
          </div>
          <div class="form-group">
            <button class="btn btn-primary" :disabled="$v.$invalid">Add Category</button>
            <a class="btn btn-secondary ml-1" @click.prevent="$modal.hide('addCategory')">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  </modal>
</template>

<script>
import { required, minLength } from "vuelidate/lib/validators";
import { fb, db } from "@/firebase/init";

export default {
  name: "AddCategory",
  data() {
    return {
      category: {
        name: ""
      }
    };
  },
  validations: {
    category: {
      name: {
        required,
        minLength: minLength(2)
      }
    }
  },
  methods: {
    addCategory() {
      //get the company_id
      db.collection("employees")
        .doc(fb.auth().currentUser.email)
        .get()
        .then(doc => {
          this.category.company_id = doc.data().company_id;
          let category = this.category;
          category.created_at = Math.floor(Date.now() / 1000);
          category.updated_at = Math.floor(Date.now() / 1000);
          db.collection("categories")
            .add(category)
            .then(() => {
              this.category = {};
              this.$modal.hide("addCategory");
            });
        });
    }
  }
};
</script>