<template>
  <modal name="editEmployee" @before-open="getEmployee" :height="350">
    <form @submit.prevent="update">
      <div class="card">
        <div class="card-header">
          <h4>Edit Employee</h4>
        </div>
        <div class="card-body">
          <div class="form-group" :class="{invalid: $v.employee.name.$error}">
            <label for="name">Name</label>
            <input
              type="text"
              name="name"
              class="form-control"
              v-model="employee.name"
              @blur="$v.employee.name.$touch()"
            />
            <p
              v-if="$v.employee.name.$error"
              class="text-danger"
            >Employee name must contain at least 4 characters.</p>
          </div>
          <div class="form-group">
            <button class="btn btn-primary" type="submit" :disabled="$v.$invalid">Update</button>
            <button
              class="btn btn-secondary ml-1"
              @click.prevent="$modal.hide('editEmployee')"
            >Cancel</button>
          </div>
        </div>
      </div>
    </form>
  </modal>
</template>

<script>
import { db, fb } from "@/firebase/init";
import { required, minLength } from "vuelidate/lib/validators";

export default {
  name: "EditEmployee",
  data() {
    return {
      employee: {}
    };
  },
  validations: {
    employee: {
      name: { required, minLength: minLength(4) }
    }
  },
  methods: {
    getEmployee(event) {
      this.employee = event.params.employee;
    },
    update() {
      let employee = this.employee;
      employee.updated_at = Math.floor(Date.now() / 1000);
      db.collection("employees")
        .doc(this.employee.id)
        .update(employee)
        .then(() => {
          this.$modal.hide("editEmployee");
        });
    }
  }
};
</script>

