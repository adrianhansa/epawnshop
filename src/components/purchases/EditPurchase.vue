<template>
  <modal name="editPurchase" :height="650" @before-open="getPurchase">
    <div class="card">
      <div class="card-header">
        <h4>Edit purchase from {{ purchase.customer_name }}</h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="updatePurchase">
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
          <div class="form-group">
            <label for="product_image">Upload image</label>
            <input type="file" id="product_image" @change="uploadImage" class="form-control" />
          </div>
          <div class="form-group" style="overflow-y: scroll;">
            <ul class="list-group list-group-horizontal-md">
              <li class="list-group-item" v-for="(image,index) in purchase.images" :key="index">
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                  <img :src="image" :alt="image" width="100" height="100" />
                  <button
                    type="button"
                    class="close"
                    @click="deleteImage(image,index)"
                    data-dismiss="alert"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              </li>
            </ul>
          </div>
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
          <div class="form-group">
            <button class="btn btn-primary" type="submit" :disabled="$v.$invalid">Update Purchase</button>
            <a
              href="#"
              @click.prevent="$modal.hide('editPurchase')"
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

export default {
  name: "EditPurchase",
  data() {
    return {
      purchase: {
        name: "",
        category: "",
        amount: "",
        costPerUnit: "",
        images: []
      }
    };
  },
  methods: {
    getPurchase(event) {
      this.purchase = event.params.purchase;
    },
    updatePurchase() {
      this.purchase.costPerUnit = Number(this.purchase.costPerUnit).toFixed(2);
      this.purchase.employee_id = fb.auth().currentUser.email;
      this.purchase.updated_at = Math.floor(Date.now() / 1000);
      db.collection("purchases")
        .doc(this.purchase.id)
        .update(this.purchase)
        .then(() => {
          this.purchase = {};
          this.$modal.hide("editPurchase");
        });
    },
    deleteImage(image, index) {
      //Delete existing images
      let imageRef = fb.storage().refFromURL(image);
      this.purchase.images.splice(index, 1);
      //update the images for this purchase in purhases
      db.collection("purchases")
        .doc(this.purchase.id)
        .update("images", this.purchase.images);

      //TO DO: Update the product too

      //delete the image from storage
      imageRef
        .delete()
        .then(() => {
          console.log("Image deleted");
        })
        .catch(error => {
          console.log("An error has occured");
        });
    },
    uploadImage(e) {
      let file = e.target.files[0];
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
      }
    }
  }
};
</script>