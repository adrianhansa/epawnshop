<template>
  <modal name="editCustomer" @before-open="getCustomer" :height="250">
    <div class="card">
      <div class="card-header">
        <h5>Edit customer</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="updateCustomer">
          <div class="form-group" :class="{invalid: $v.customer.name.$error}">
            <label for="name">Customer name</label>
            <input
              type="text"
              id="name"
              v-model="customer.name"
              @blur="$v.customer.name.$touch()"
              class="form-control"
            />
            <p
              v-if="$v.customer.name.$error"
              class="text-danger"
            >The customer name must contain at least 3 characters.</p>
          </div>
          <div class="form-group">
            <button type="submit" class="btn btn-success" :disabled="$v.$invalid">Update Customer</button>
            <a
              href="#"
              class="btn btn-secondary ml-1"
              @click.prevent="$modal.hide('editCustomer')"
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
  name: "EditCustomer",
  data() {
    return {
      customer_id: "",
      customer: {
        name: ""
      }
    };
  },
  validations: {
    customer: {
      name: { required, minLength: minLength(3) }
    }
  },
  methods: {
    getCustomer(event) {
      this.customer_id = event.params.customer.id;
      this.customer.name = event.params.customer.name;
      this.customer.shop_id = event.params.customer.shop_id;
      this.customer.company_id = event.params.customer.company_id;
      this.customer.updated_at = Math.floor(Date.now()/1000);
    },
    updateCustomer() {
      db.collection("customers")
        .doc(this.customer_id)
        .update(this.customer)
        .then(() => {
          this.customer = {};
          this.$modal.hide("editCustomer");
        });
    }
  }
};
</script>