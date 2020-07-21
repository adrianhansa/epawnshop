<template>
  <modal name="addShop" :height="400">
    <div class="card" style="width: 36rem;">
      <div class="card-body">
        <h5 class="card-title">Add Shop</h5>
        <form @submit.prevent="addShop">
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
          <p v-if="feedback" class="text-danger">{{ feedback }}</p>
          <div class="form-group">
            <a href="#" class="btn btn-secondary" @click.prevent="$modal.hide('addShop')">Cancel</a>
            <button type="submit" class="ml-2 btn btn-primary" :disabled="$v.$invalid">Add Shop</button>
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
  name: "AddShop",
  computed: {
    ...mapGetters(["user"])
  },
  data() {
    return {
      shop: {
        name: null,
        address: null
      },
      feedback: ""
    };
  },
  validations: {
    shop: {
      name: { required, minLength: minLength(2) },
      address: { required }
    }
  },
  methods: {
    addShop() {
      if (this.shop.name && this.shop.address) {
        //Check if the shop name is unique for this company
        let slug = slugify(this.shop.name, {
          lower: true,
          replacement: "-",
          remove: /[$*_+`~#'"-/!?:@,]/g
        });
        db.collection("shops")
          .doc(slug)
          .get()
          .then(doc => {
            if (doc.exists) {
              this.feedback =
                "You already have a shop with this name. Please choose a different name.";
            } else {
              db.collection("shops")
                .doc(slug)
                .set({
                  company_id: this.user.company_id,
                  name: this.shop.name,
                  address: this.shop.address,
                  created_at: Math.floor(Date.now() / 1000),
                  updated_at: Math.floor(Date.now() / 1000)
                })
                .then(() => {
                  this.shop = {};
                  this.$modal.hide("addShop");
                });
            }
          });
      } else {
        this.feedback = "All fields are ruquired";
      }
    }
  },
  created() {
    this.$store.dispatch("user");
  }
};
</script>

<style>
</style>