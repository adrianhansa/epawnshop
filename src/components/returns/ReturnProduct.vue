<template>
  <modal name="returnProduct" @before-open="getProduct" :height="450" :width="300">
    <div class="card">
      <div class="card-header">
        <h4>Return {{ product.product }}</h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="returnItem(product.id)">
          <div class="form-group">
            Customer name:
            <label>{{ product.customer_name }}</label>
          </div>
          <div class="form-group">
            Product name:
            <label>{{ product.name}}</label>
          </div>
          <div class="form-group">
            <label for="amount">Amount</label>
            <select v-if="product.amount" v-model="amount" class="form-control">
              <option v-for="n in Number(product.amount)" :key="n">{{ n }}</option>
            </select>
          </div>
          <div class="form-group" :class="{invalid: $v.returningPricePerUnit.$error}">
            <label
              for="returningPricePerUnit"
            >Selling price per unit (recommended {{ Number(product.costPerUnit) + Number(product.costPerUnit) * daysInShop * interest }})</label>
            <input
              type="text"
              class="form-control"
              id="sellingPricePerUnit"
              v-model="returningPricePerUnit"
              @blur="$v.returningPricePerUnit.$touch()"
            />
            <p
              class="text-danger"
              v-if="$v.returningPricePerUnit.$error"
            >Returning price per unit is required and munst be a numeric value greater that 0.00</p>
            <p v-if="returningPricePerUnit">{{ total }}</p>
          </div>
          <div class="form-group">
            <button class="btn btn-primary" type="submit">Return</button>
            <a
              href="#"
              class="btn btn-secondary ml-1"
              @click.prevent="$modal.hide('returnProduct')"
            >Cancel</a>
          </div>
        </form>
      </div>
    </div>
  </modal>
</template>

<script>
import { fb, db } from "@/firebase/init";
import { required, decimal, minValue } from "vuelidate/lib/validators";

export default {
  name: "ReturnProduct",
  data() {
    return {
      product: {},
      amount: "",
      returningPricePerUnit: "",
      interest: 0.05
    };
  },
  computed: {
    total() {
      if (this.returningPricePerUnit) {
        return Number(this.returningPricePerUnit) * this.amount;
      }
    },
    daysInShop() {
      return Math.floor(
        (Date.now() / 1000 - this.product.created_at) / 86400
      ).toFixed(0);
    }
  },
  validations: {
    returningPricePerUnit: { required, decimal, minValue: minValue(0.01) }
  },
  methods: {
    returnItem(id) {
      let ref = db.collection("purchases").doc(id);
      ref.get().then(doc => {
        let amountLeft = Number(doc.data().amount) - this.amount;
        //updating the product in purchases collection:
        if (amountLeft == 0) {
          //if the amount sold = amount existing for that product, delete the product from products
          ref.delete().then(() => {
            //CHECK IF THE PRODUCT HAS IMAGES AND DELETE THEM
            if (doc.data().images) {
              doc.data().images.forEach(image => {
                let imgRef = fb.storage().refFromURL(image);
                imgRef.delete();
              });
            }
          });
        } else if (amountLeft > 0) {
          //if the amount sold < amount existing, then update the amount of product in purchases collection
          ref.update({ amount: amountLeft }).then(() => {
            console.log("Product amount updated");
          });
        }
        //create a new record in sales:
        //product name, shop_name, staff_name, customer_name, product, amount, cost_per_unit, total
        let returnItem = {}; //this.product;
        returnItem.purchasingCost = Number(this.product.costPerUnit);
        returnItem.company_id = this.product.company_id;
        returnItem.customer_id = this.product.customer_id;
        returnItem.employee_id = this.product.employee_id;
        returnItem.purchase_id = this.product.id;
        returnItem.product_name = this.product.name;
        returnItem.shop_id = this.product.shop_id;
        returnItem.category_id = this.product.category_id;
        returnItem.amount = Number(this.amount);
        returnItem.quality = this.product.quality;
        returnItem.returningPricePerUnit = Number(this.returningPricePerUnit);
        returnItem.created_at = Math.floor(Date.now() / 1000);
        returnItem.updated_at = Math.floor(Date.now() / 1000);
        returnItem.total = Number(this.total);
        db.collection("returns").add(returnItem);

        //close the dialog
        this.$modal.hide("returnProduct");
      });
    },
    getProduct(event) {
      this.product = event.params.product;
      this.amount = Number(event.params.product.amount);
    }
  }
};
</script>