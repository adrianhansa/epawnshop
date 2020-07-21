<template>
  <modal name="sellProduct" @before-open="getProduct" :height="450" :width="300">
    <div class="card">
      <div class="card-header">
        <h4>Sell {{ product.product }}</h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="sell(product.id)">
          <div class="form-group">
            Customer name:
            <label>{{ product.customer_name }}</label>
          </div>
          <div class="form-group">
            <label for="amount">Amount</label>
            <select v-if="product.amount" v-model="amount" class="form-control">
              <option v-for="n in Number(product.amount)" :key="n">{{ n }}</option>
            </select>
          </div>
          <div class="form-group" :class="{invalid: $v.sellingPricePerUnit.$error}">
            <label
              for="sellingPricePerUnit"
            >Selling price per unit (greater than {{ product.costPerUnit }})</label>
            <input
              type="text"
              class="form-control"
              id="sellingPricePerUnit"
              v-model="sellingPricePerUnit"
              @blur="$v.sellingPricePerUnit.$touch()"
            />
            <p
              class="text-danger"
              v-if="$v.sellingPricePerUnit.$error"
            >Selling price per unit is required and munst be a numeric value greater that 0.00</p>
            <p v-if="sellingPricePerUnit">{{ total }}</p>
          </div>
          <div class="form-group">
            <button class="btn btn-primary" type="submit">Sell</button>
            <a
              href="#"
              class="btn btn-secondary ml-1"
              @click.prevent="$modal.hide('sellProduct')"
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
  name: "SellProduct",
  data() {
    return {
      product: {},
      amount: "",
      sellingPricePerUnit: ""
    };
  },
  computed: {
    total() {
      if (this.sellingPricePerUnit) {
        return (Number(this.sellingPricePerUnit) * this.amount).toFixed(2);
      }
    }
  },
  validations: {
    sellingPricePerUnit: { required, decimal, minValue: minValue(0.01) }
  },
  methods: {
    sell(id) {
      let ref = db.collection("purchases").doc(id);
      ref.get().then(doc => {
        let amountLeft = Number(doc.data().amount) - this.amount;
        //updating the product in products collection:
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
          //if the amount sold < amount existing, then update the amount of product in products collection
          ref.update({ amount: amountLeft }).then(() => {
            console.log("Product amount updated");
          });
        }
        //create a new record in sales:
        //product name, shop_name, staff_name, customer_name, product, amount, cost_per_unit, total
        let sale = {}; //this.product;
        sale.buyingCost = Number(this.product.costPerUnit);
        sale.company_id = this.product.company_id;
        sale.customer_id = this.product.customer_id;
        sale.employee_id = this.product.employee_id;
        sale.purchase_id = this.product.id;
        sale.product_name = this.product.name;
        sale.shop_id = this.product.shop_id;
        sale.category_id = this.product.category_id;
        sale.amount = this.amount;
        sale.quality = this.product.quality;
        sale.sellingPricePerUnit = Number(this.sellingPricePerUnit);
        sale.created_at = Math.floor(Date.now() / 1000);
        sale.updated_at = Math.floor(Date.now() / 1000);
        sale.total = this.total;
        db.collection("sales").add(sale);

        //close the dialog
        this.$modal.hide("sellProduct");
      });
    },
    getProduct(event) {
      this.product = event.params.product;
      this.amount = Number(event.params.product.amount);
    }
  }
};
</script>