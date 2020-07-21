<template>
  <modal name="editShop" :height="400" @before-open="getShop">
    <div class="card">
      <div class="card-header">
        <h5>Add Shop</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="updateShop">
          <div class="form-group" :class="{invalid: $v.shop.name.$error}">
            <label for="name">Shop name</label>
            <input
              type="text"
              name="name"
              class="form-control"
              @blur="$v.shop.name.$touch()"
              v-model="shop.name"
            />
            <p v-if="$v.shop.name.$error" class="text-danger">
              The
              <strong>name</strong> field is required and it must contain at least 2 characters.
            </p>
          </div>
          <div class="form-group" :class="{invalid: $v.shop.address.$error}">
            <label for="address">Address</label>
            <input
              type="text"
              name="address"
              class="form-control"
              @blur="$v.shop.address.$touch()"
              v-model="shop.address"
            />
            <p v-if="$v.shop.address.$error" class="text-danger">
              The
              <strong>address</strong> field is required.
            </p>
          </div>
          <div class="form-group">
            <a href="#" class="btn btn-secondary" @click.prevent="$modal.hide('editShop')">Cancel</a>
            <button type="submit" class="ml-2 btn btn-primary" :disabled="$v.$invalid">Update Shop</button>
          </div>
        </form>
      </div>
    </div>
  </modal>
</template>

<script>
import { db, fb } from "../../firebase/init";
import slugify from "slugify";
import { mapGetters } from "vuex";
import { required, minLength } from "vuelidate/lib/validators";

export default {
  name: "EditShop",
  computed: {
    ...mapGetters(["user"])
  },
  data() {
    return {
      shop: {
        name: null,
        address: null
      }
    };
  },
  validations: {
    shop: {
      name: { required, minLength: minLength(2) },
      address: { required }
    }
  },
  methods: {
    getShop(event) {
      this.shop = event.params.shop;
    },
    updateShop() {
      db.collection("shops")
        .doc(this.shop.id)
        .update({
          name: this.shop.name,
          address: this.shop.address,
          updated_at: Math.floor(Date.now() / 1000)
        })
        .then(() => {
          this.$modal.hide("editShop");
        });
    }
  },
  created() {
    this.$store.dispatch("user");
  }
};
</script>

<style>
</style>