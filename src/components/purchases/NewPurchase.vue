<template>
  <modal name="newPurchase" :height="850" :width="400" @before-open="getCustomer">
    <div class="card">
      <div class="card-header">
        <h5>Make a New Purchase from {{ customer.name }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="recordPurchase">
          <div class="form-group" :class="{invalid: $v.purchase.name.$error}">
            <label for="name">Product name</label>
            <input
              type="text"
              class="form-control"
              @blur="$v.purchase.name.$touch()"
              v-model="purchase.name"
              id="name"
            />
            <p
              class="text-danger"
              v-if="$v.purchase.name.$error"
            >Product name must contain at least 3 characters.</p>
          </div>
          <div class="form-group" :class="{invalid: $v.purchase.category_id.$error}">
            <label for="categories">Please select a category</label>
            <select class="form-control" v-model="purchase.category_id" id="category_id">
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >{{ category.name }}</option>
            </select>
            <p
              class="text-danger"
              v-if="$v.purchase.category_id.$error"
            >Please select a category for this product.</p>
          </div>
          <div class="form-group">
            <label for="quality">Quality</label>
            <select class="form-control" v-model="purchase.quality" id="quality">
              <option
                v-for="(quality,index) in qualities"
                :key="index"
                :value="quality"
              >{{ quality }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="product_image">Upload image</label>
            <input type="file" id="product_image" @change="uploadImage" class="form-control" />
            <!-- <ul v-if="purchase.images">
              <li v-for="(image,index) in purchase.images" :key="index">
                <img :src="image" width="20" height="20" />
              </li>
            </ul>-->
            <Carousel :images="purchase.images" :productID="purchase.name" />
          </div>
          <div class="row">
            <div class="col-sm-6">
              <div class="form-group" :class="{invalid: $v.purchase.amount.$error}">
                <label for="amount">Amount</label>
                <input
                  type="text"
                  class="form-control"
                  @blur="$v.purchase.amount.$touch()"
                  v-model="purchase.amount"
                  id="amount"
                />
                <p
                  class="text-danger"
                  v-if="$v.purchase.amount.$error"
                >You must enter a numeric value greater than 0 for the amount</p>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="form-group" :class="{invalid: $v.purchase.costPerUnit.$error}">
                <label for="costPerUnit">Cost per unit</label>
                <input
                  type="text"
                  class="form-control"
                  @blur="$v.purchase.costPerUnit.$touch()"
                  v-model="purchase.costPerUnit"
                  id="costPerUnit"
                />
                <p
                  class="text-danger"
                  v-if="$v.purchase.costPerUnit.$error"
                >This field cannot be left empty and must contain a numeric value greater than 0.</p>
              </div>
            </div>
          </div>
          <div class="form-group">
            <button class="btn btn-primary" type="submit" :disabled="$v.$invalid">Record Purchase</button>
            <a
              href="#"
              @click.prevent="$modal.hide('newPurchase')"
              class="btn btn-secondary ml-1"
            >Cancel</a>
          </div>
        </form>
      </div>
    </div>
  </modal>
</template>

<script>
import { fb, db } from "@/firebase/init";
import {
  required,
  numeric,
  minLength,
  minValue,
  decimal
} from "vuelidate/lib/validators";
import Carousel from "../layout/Carousel";

export default {
  name: "NewPurchase",
  components: { Carousel },
  data() {
    return {
      categories: [],
      qualities: ["A", "B", "C", "D", "E"],
      customer: {},
      purchase: {
        category_id: "",
        name: "",
        amount: "",
        costPerUnit: "",
        images: []
      }
    };
  },
  methods: {
    getCustomer(event) {
      this.customer = event.params.customer;
      //check if categories are loaded from a previous access of this modal
      if (!this.categories.length) {
        //get categories
        db.collection("categories")
          .where("company_id", "==", event.params.customer.company_id)
          .get()
          .then(docs => {
            docs.forEach(doc => {
              let category = doc.data();
              category.id = doc.id;
              this.categories.push(category);
            });
          });
      }
    },
    uploadImage(e) {
      let file = e.target.files[0];
      //CHECK IF THE FILE IS AN IMAGE TYPE AND NOT BIGGER THAN 1MB
      // console.log(file);
      if (file.type === "image/jpeg") {
        if (file.size <= 1024 * 1024) {
          var storageRef = fb.storage().ref("purchases/" + file.name);
          let uploadTask = storageRef.put(file);
          uploadTask.on(
            "state_changed",
            snapshot => {},
            error => {
              console.log(error);
            },
            () => {
              uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                console.log("File available at " + downloadURL);
                this.purchase.images.push(downloadURL);
              });
            }
          );
        } else {
          console.log(
            "This file is larger than 1MB. Please select a smaller one."
          );
        }
      } else {
        console.log("This file is not an image");
      }
    },
    recordPurchase() {
      //get the purchase id
      let ref = db.collection("purchases").doc();
      this.purchase.costPerUnit = Number(this.purchase.costPerUnit).toFixed(2);
      this.purchase.customer_id = this.customer.id;
      this.purchase.customer_name = this.customer.name;
      this.purchase.shop_id = this.customer.shop_id;
      this.purchase.company_id = this.customer.company_id;
      this.purchase.employee_id = fb.auth().currentUser.email;
      this.purchase.created_at = Math.floor(Date.now() / 1000);
      this.purchase.updated_at = Math.floor(Date.now() / 1000);
      ref.set(this.purchase).then(() => {
        this.purchase = {};
        this.$modal.hide("newPurchase");
      });
    }
  },
  validations: {
    purchase: {
      name: {
        required,
        minLength: minLength(3)
      },
      amount: {
        required,
        numeric,
        minValue: minValue(1)
      },
      costPerUnit: {
        required,
        decimal,
        minValue: minValue(0.01)
      },
      category_id: {
        required
      }
    }
  }
};
</script>