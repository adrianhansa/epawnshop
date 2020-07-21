<template>
  <div class="purchases">
    <h2>Purchases ({{ filteredPurchases.length }})</h2>
    <button
      @click.prevent="cardView = false"
      class="btn"
      :class="{'inactive':cardView,'active':!cardView}"
    >
      <i class="fas fa-table"></i> Table view
    </button>
    <button
      @click.prevent="cardView = true"
      class="btn ml-1"
      :class="{'active':cardView,'inactive':!cardView}"
    >
      <i class="fas fa-id-card"></i> Card view
    </button>
    <EditPurchase />
    <SellProduct />
    <ReturnProduct />
    <template v-if="purchases.length">
      <input
        type="text"
        class="form-control mt-2"
        placeholder="Search for purchase by product, customer or shop"
        v-model="search"
      />
      <div class="row mt-1">
        <template v-if="cardView">
          <div
            class="col-sm-3 ml-3 mt-2 card mb-3 p-0"
            v-for="purchase in filteredPurchases"
            :key="purchase.id"
            style="max-width: 18rem;"
          >
            <div
              class="card-header text-center text-white bg-info"
            >{{ purchase.category_name }} in {{ purchase.shop_name }}</div>
            <div class="card-body">
              <h5 class="card-title">{{ purchase.name }} ({{ purchase.amount }})</h5>
              <p class="card-text">
                Customer:
                <br />
                {{ purchase.customer_name }}
              </p>
              <p v-if="purchase.quality" class="card-text">
                Quality:
                <br />
                {{ purchase.quality }}
              </p>
              <p
                class="card-text"
              >Cost per unit: {{ Number(purchase.costPerUnit).toFixed(2) }}. (Total: {{ (purchase.amount * purchase.costPerUnit).toFixed(2) }})</p>
              <p>Purchased date: {{ purchase.created_at|date }}</p>
              <p>
                Days in store: {{ Math.floor(
                (Date.now()/1000 - purchase.created_at) /
                86400
                ) }}
              </p>
              <Carousel :images="purchase.images" :productID="purchase.id" />
            </div>
            <div class="card-footer">
              <a
                href="#"
                @click.prevent="$modal.show('editPurchase',{purchase:purchase})"
                class="btn btn-sm btn-success"
              >
                <i class="fas fa-edit"></i> Edit
              </a>
              <button class="btn btn-sm btn-danger ml-1" @click.prevent="del(purchase)">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
              <hr />
              <button
                @click.prevent="$modal.show('sellProduct',{product:purchase})"
                class="btn btn-sm btn-primary"
              >
                <i class="far fa-money-bill-alt"></i> Sell
              </button>
              <button
                @click.prevent="$modal.show('returnProduct',{product:purchase})"
                class="btn btn-sm btn-primary ml-1"
              >
                <i class="fas fa-cash-register"></i> Return
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <v-table
            class="table table-striped"
            :data="filteredPurchases"
            :currentPage.sync="currentPage"
            :pageSize="pageSize"
            @totalPagesChanged="totalPages = $event"
          >
            <thead slot="head">
              <v-th sortKey="shop_name">Shop</v-th>
              <v-th sortKey="customer_name">Customer</v-th>
              <v-th sortKey="name">Product name</v-th>
              <v-th sortKey="quality">Quality</v-th>
              <v-th sortKey="amount">Amount</v-th>
              <v-th sortKey="costPerUnit">Purchase cost/unit</v-th>
              <th>Total value</th>
              <v-th sortKey="created_at">Purchase date</v-th>
              <th>Days in store</th>
              <th>Sell/Return</th>
              <th>Edit/Delete</th>
            </thead>
            <tbody slot="body" slot-scope="{displayData}">
              <tr v-for="purchase in displayData" :key="purchase.id">
                <td>{{ purchase.shop_name }}</td>
                <td>{{ purchase.customer_name }}</td>
                <td>{{ purchase.name }}</td>
                <td>{{ purchase.quality ? purchase.quality:null }}</td>
                <td>{{ purchase.amount }}</td>
                <td>{{ purchase.costPerUnit }}</td>
                <td>{{ (purchase.amount * purchase.costPerUnit).toFixed(2) }}</td>
                <td>{{ purchase.created_at|date }}</td>
                <td>
                  {{ Math.floor(
                  (Date.now()/1000 - purchase.created_at) /
                  86400
                  ) }}
                </td>
                <td>
                  <button
                    @click.prevent="$modal.show('sellProduct',{product:purchase})"
                    class="btn btn-sm btn-primary"
                  >
                    <i class="far fa-money-bill-alt"></i> Sell
                  </button>
                  <button
                    @click.prevent="$modal.show('returnProduct',{product:purchase})"
                    class="btn btn-sm btn-primary ml-1"
                  >
                    <i class="fas fa-cash-register"></i> Return
                  </button>
                </td>
                <td>
                  <a
                    href="#"
                    @click.prevent="$modal.show('editPurchase',{purchase:purchase})"
                    class="btn btn-sm btn-success"
                  >
                    <i class="fas fa-edit"></i> Edit
                  </a>
                  <button class="btn btn-sm btn-danger ml-1" @click.prevent="del(purchase)">
                    <i class="fas fa-trash-alt"></i> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </v-table>
          <smart-pagination :currentPage.sync="currentPage" :totalPages="totalPages" />
        </template>
      </div>
    </template>
    <template v-else>
      <p>No purchases recorded yet.</p>
    </template>
  </div>
</template>

<script>
import { db, fb } from "@/firebase/init";
import Swal from "sweetalert2/dist/sweetalert2.js";
import EditPurchase from "./EditPurchase";
import SellProduct from "../sales/SellProduct";
import ReturnProduct from "../returns/ReturnProduct";
import Carousel from "../layout/Carousel";

export default {
  name: "Purchases",
  components: { EditPurchase, Carousel, SellProduct, ReturnProduct },
  data() {
    return {
      purchases: [],
      search: "",
      cardView: true,
      currentPage: 1,
      totalPages: 0,
      pageSize: 2
    };
  },
  methods: {
    del(purchase) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(result => {
        if (result.value) {
          //cycle through all the images of this purchase
          if (purchase.images) {
            purchase.images.forEach(image => {
              let imgRef = fb.storage().refFromURL(image);
              imgRef.delete();
            });
          }
          db.collection("purchases")
            .doc(purchase.id)
            .delete();
          // .then(() => {
          //   //CHECK IF THE PURCHASE HAS IMAGES AND DELETE THEM
          // });
          // Swal.fire("Deleted!", "Your file has been deleted.", "success");
        }
      });
    },
    getPurchases(field, scope) {
      db.collection("purchases")
        .where(field, "==", scope)
        .onSnapshot(snapshot => {
          this.purchases = [];
          snapshot.forEach(doc => {
            //get the category name
            db.collection("categories")
              .doc(doc.data().category_id)
              .get()
              .then(cat => {
                //get the shop name
                db.collection("shops")
                  .doc(doc.data().shop_id)
                  .get()
                  .then(shop => {
                    let purchase = doc.data();
                    purchase.id = doc.id;
                    purchase.category_name = cat.data().name;
                    purchase.shop_name = shop.data().name;
                    this.purchases.push(purchase);
                  });
              });
          });
        });
    }
  },
  computed: {
    filteredPurchases() {
      return this.purchases.filter(purchase => {
        return (
          purchase.name.match(this.search) ||
          purchase.customer_name.match(this.search) ||
          purchase.shop_name.match(this.search) ||
          purchase.category_name.match(this.search)
        );
      });
    }
  },
  created() {
    db.collection("employees")
      .doc(fb.auth().currentUser.email)
      .get()
      .then(doc => {
        if (doc.data().admin) {
          this.getPurchases("company_id", doc.data().company_id);
        } else {
          this.getPurchases("shop_id", doc.data().shop_id);
        }
      });
  }
};
</script>