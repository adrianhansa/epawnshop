<template>
  <modal name="editCategory" :height="350" @before-open="getCategory">
    <div class="card">
      <div class="card-header">
        <h4>Edit Category</h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="updateCategory">
          <div class="form-group" :class="{invalid: $v.category.name.$error}" autofocus>
            <label for="name">Category name:</label>
            <input
              type="text"
              class="form-control"
              v-model="category.name"
              @blur="$v.category.name.$touch()"
            />
            <p
              v-if="$v.category.name.$error"
              class="text-danger"
            >This field is required and it must contain at least two characters.</p>
          </div>
          <div class="form-group">
            <button class="btn btn-success">Update Category</button>
            <a class="btn btn-secondary ml-1" @click.prevent="$modal.hide('editCategory')">Cancel</a>
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
    getCategory(event) {
      this.category = event.params.category;
    },
    updateCategory() {
      db.collection("categories")
        .doc(this.category.id)
        .update({
          updated_at: Math.floor(Date.now() / 1000),
          name: this.category.name
        })
        .then(() => this.$modal.hide("editCategory"));
    }
  }
};
</script>