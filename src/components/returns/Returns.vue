<template>
  <div class="returns">
    <h2>Returns</h2>
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
    <template v-if="returns.length">
      <input
        type="text"
        class="form-control mt-2"
        placeholder="Search for product returned by name, customer or shop"
        v-model="search"
      />
      <div class="row mt-1">
        <template v-if="cardView">
          <div
            class="col-sm-3 ml-3 mt-2 card mb-3 p-0"
            v-for="returnItem in filteredReturns"
            :key="returnItem.id"
            style="max-width: 18rem;"
          >
            <div
              class="card-header text-center text-white bg-info"
            >{{ returnItem.category_name }} in {{ returnItem.shop_name }}</div>
            <div class="card-body">
              <h5 class="card-title">{{ returnItem.product_name }} ({{ returnItem.amount }})</h5>
              <p class="card-text">
                Customer:
                <br />
                {{ returnItem.customer_name }}
              </p>
              <p
                class="card-text"
              >Cost per unit: {{ Number(returnItem.returningPricePerUnit).toFixed(2) }}. (Total: {{ Number(returnItem.total).toFixed(2) }})</p>
              <p class="card-text" v-if="returnItem.quality">Quality: {{ returnItem.quality }}</p>
            </div>

            <div class="card-footer">
              <p>Return date: {{ returnItem.created_at|date }}</p>
            </div>
          </div>
        </template>
        <template v-else>
          <v-table
            class="table table-striped"
            :data="filteredReturns"
            :currentPage.sync="currentPage"
            :pageSize="pageSize"
            @totalPagesChanged="totalPages = $event"
          >
            <thead slot="head">
              <v-th sortKey="shop_name">Shop</v-th>
              <v-th sortKey="created_at">Created at</v-th>
              <v-th sortKey="updated_at">Modified at</v-th>
              <v-th sortKey="product_name">Product name</v-th>
              <v-th sortKey="quality">Quality</v-th>
              <v-th sortKey="category_name">Category</v-th>
              <v-th sortKey="amount">Amount</v-th>
              <v-th sortKey="returningPricePerUnit">Cost/unit</v-th>
              <v-th sortKey="total">Total</v-th>
            </thead>
            <tbody slot="body" slot-scope="{displayData}">
              <tr v-for="returnItem in displayData" :key="returnItem.id">
                <td>{{ returnItem.shop_name }}</td>
                <td>{{ returnItem.created_at|date }}</td>
                <td>{{ returnItem.updated_at|date }}</td>
                <td>{{ returnItem.product_name }}</td>
                <td>{{ returnItem.quality ? returnItem.quality : null }}</td>
                <td>{{ returnItem.category_name }}</td>
                <td>{{ returnItem.amount }}</td>
                <td>{{ Number(returnItem.returningPricePerUnit).toFixed(2) }}</td>
                <td>{{ Number(returnItem.total).toFixed(2) }}</td>
              </tr>
            </tbody>
          </v-table>
          <smart-pagination :currentPage.sync="currentPage" :totalPages="totalPages" />
        </template>
      </div>
    </template>
    <template v-else>
      <p>No items returned yet.</p>
    </template>
  </div>
</template>

<script>
import { db, fb } from "@/firebase/init";

export default {
  name: "Returns",
  data() {
    return {
      returns: [],
      search: "",
      cardView: true,
      currentPage: 1,
      totalPages: 0,
      pageSize: 5
    };
  },
  methods: {
    getReturns(field, scope) {
      db.collection("returns")
        .where(field, "==", scope)
        .onSnapshot(snapshot => {
          this.returns = [];
          snapshot.forEach(doc => {
            //get the category name
            if (doc.exists) {
              db.collection("categories")
                .doc(doc.data().category_id)
                .get()
                .then(cat => {
                  //get the shop name
                  db.collection("shops")
                    .doc(doc.data().shop_id)
                    .get()
                    .then(shop => {
                      let returnItem = doc.data();
                      returnItem.id = doc.id;
                      returnItem.category_name = cat.data().name;
                      returnItem.shop_name = shop.data().name;
                      //get customer name
                      db.collection("customers")
                        .doc(doc.data().customer_id)
                        .get()
                        .then(doc => {
                          returnItem.customer_name = doc.data().name;
                        });
                      this.returns.push(returnItem);
                    });
                });
            }
          });
        });
    }
  },
  computed: {
    filteredReturns() {
      return this.returns.filter(returnItem => {
        return (
          returnItem.product_name.match(this.search) ||
          returnItem.customer_name.match(this.search) ||
          returnItem.shop_name.match(this.search) ||
          returnItem.category_name.match(this.search)
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
          this.getReturns("company_id", doc.data().company_id);
        } else {
          this.getReturns("shop_id", doc.data().shop_id);
        }
      });
  }
};
</script>