<template>
  <modal name="addEmployee" :height="450">
    <div class="card">
      <div class="card-header">
        <h3 class="text-center">Add Employee</h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="addEmployee">
          <div class="form-group" :class="{invalid: $v.employee.name.$error}">
            <label for="name">Employee name</label>
            <input
              type="text"
              class="form-control"
              id="name"
              v-model="employee.name"
              @blur="$v.employee.name.$touch()"
            />
            <p v-if="$v.employee.name.$error" class="text-danger">
              This
              <strong>name</strong> field is required and must contain at least 4 characters.
            </p>
          </div>
          <div class="form-group" :class="{invalid: $v.employee.email.$error}">
            <label for="email">Employee email address</label>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="employee.email"
              @blur="$v.employee.email.$touch()"
            />
            <p v-if="$v.employee.email.$error" class="text-danger">
              The
              <strong>email</strong> field is required and must contain a valid address.
            </p>
          </div>
          <div class="form-group" :class="{invalid: $v.employee.shop_id.$error}">
            <label for="shop">Select shop:</label>
            <select class="form-control" id="shop" v-model="employee.shop_id">
              <option
                v-for="shop in shops"
                :value="shop.id"
                :key="shop.id"
                @blur="$v.employee.shop_id.$touch()"
              >{{ shop.name }}</option>
            </select>
            <p
              v-if="$v.employee.shop_id.$error"
              class="text-danger"
            >Please select a shop for this employee.</p>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="$v.$invalid">Save</button>
          <button class="btn btn-secondary ml-1" @click.prevent="$modal.hide('addEmployee')">Cancel</button>
        </form>
      </div>
    </div>
  </modal>
</template>

<script>
import { fb, db } from "@/firebase/init";
import slugify from "slugify";
import { mapGetters } from "vuex";
import { required, minLength, email } from "vuelidate/lib/validators";

export default {
  name: "AddEmployee",
  data() {
    return {
      company_id: null,
      company_name: null,
      employee: {
        shop_id: null,
        name: null,
        active: true,
        admin: false,
        owner: false,
        company_id: this.company_id,
        email: null
      },
      shops: []
    };
  },
  validations: {
    employee: {
      shop_id: {
        required
      },
      name: {
        required,
        minLength: minLength(4)
      },
      email: {
        required,
        email
      }
    }
  },
  methods: {
    addEmployee() {
      db.collection("employees")
        .doc(fb.auth().currentUser.email)
        .get()
        .then(doc => {
          //get the shop name
          db.collection("shops")
            .doc(this.employee.shop_id)
            .get()
            .then(doc => {
              db.collection("employees")
                .doc(this.employee.email)
                .set({
                  company_id: this.company_id,
                  company_name: this.company_name,
                  shop_id: this.employee.shop_id,
                  user_id: null,
                  name: this.employee.name,
                  admin: false,
                  created_at: Math.floor(Date.now() / 1000),
                  updated_at: Math.floor(Date.now() / 1000)
                })
                .then(() => {
                  //2. send an auth link to the employee's email
                  let actionCodeSettings = {
                    // URL you want to redirect back to. The domain (www.example.com) for this
                    // URL must be whitelisted in the Firebase Console.
                    url:
                      "https://pawnshop-8e37d.firebaseapp.com/signup-with-email-link",
                    handleCodeInApp: true
                  };
                  fb.auth()
                    .sendSignInLinkToEmail(
                      this.employee.email,
                      actionCodeSettings
                    )
                    .then(() => {
                      this.$modal.hide("addEmployee");
                    });
                });
            });
        });
    }
  },
  created() {
    //set the company_id
    db.collection("employees")
      .doc(fb.auth().currentUser.email)
      .get()
      .then(doc => {
        this.company_id = doc.data().company_id;
        //get the company name:
        company: db.collection("companies")
          .doc(this.company_id)
          .get()
          .then(doc => {
            this.company_name = doc.data().name;
          });
        //retrieve the shops
        db.collection("shops")
          .where("company_id", "==", doc.data().company_id)
          .get()
          .then(docs => {
            docs.forEach(doc => {
              let shop = doc.data();
              shop.id = doc.id;
              this.shops.push(shop);
            });
          });
      });
  }
};
</script>