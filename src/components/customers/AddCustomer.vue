<template>
  <modal name="addCustomer" :height="250">
    <div class="card">
      <div class="card-header">
        <h5>Add a new customer</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="addCustomer">
          <div class="form-group" :class="{invalid: $v.customer.name.$error}">
            <label for="name">Customer name</label>
            <input
              type="text"
              id="name"
              @blur="$v.customer.name.$touch()"
              v-model="customer.name"
              class="form-control"
            />
            <p v-if="$v.customer.name.$error">Customer name must contain at least 4 character</p>
          </div>
          <div class="form-group">
            <button type="submit" class="btn btn-primary" :disabled="$v.$invalid">Add Customer</button>
            <a
              href="#"
              class="btn btn-secondary ml-1"
              @click.prevent="$modal.hide('addCustomer')"
            >Cancel</a>
          </div>
        </form>
      </div>
    </div>
  </modal>
</template>

<script>
import { db, fb } from "@/firebase/init";
import { required, minLength } from "vuelidate/lib/validators";
export default {
  name: "addCustomers",
  data() {
    return {
      customer: {
        name: null,
        shop_id: null,
        company_id: null
      }
    };
  },
  methods: {
    addCustomer() {
      db.collection("customers").add(this.customer);
      this.customer.name = null;
      this.$modal.hide("addCustomer");
    }
  },
  validations: {
    customer: {
      name: {
        required: required,
        minLength: minLength(4)
      }
    }
  },
  created() {
    db.collection("employees")
      .doc(fb.auth().currentUser.email)
      .get()
      .then(doc => {
        this.customer.shop_id = doc.data().shop_id;
        this.customer.company_id = doc.data().company_id;
        this.customer.created_at = Math.floor(Date.now() / 1000);
        this.customer.updated_at = Math.floor(Date.now() / 1000);
      });
  }
};
</script>

<style scoped>
.card {
  height: 100%;
}
</style>