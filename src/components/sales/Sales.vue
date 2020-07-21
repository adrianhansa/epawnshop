<template>
  <div class="sales">
    <h2>Sales</h2>
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
    <template v-if="sales.length">
      <div class="row mt-2">
        <div class="col-md-3">
          <div class="form-group">
            <label>Filter products by name, category, customer or shop</label>
            <input type="text" class="form-control" v-model="search" />
          </div>
        </div>
        <div class="col-md-3">
          <div class="form-group">
            <label>Select a date range:</label>
            <date-picker
              v-model="range"
              range
              confirm
              type="date"
              format="DD-MM-YYYY"
              :lang="lang"
              @confirm="confirm"
              @clear="clear"
            ></date-picker>
          </div>
        </div>
      </div>
      <div class="row mt-1">
        <template v-if="cardView">
          <div
            class="col-sm-3 ml-3 mt-2 card mb-3 p-0"
            v-for="sale in filteredSales"
            :key="sale.id"
            style="max-width: 18rem;"
          >
            <div
              class="card-header text-center text-white bg-info"
            >{{ sale.category_name }} in {{ sale.shop_name }}</div>
            <div class="card-body">
              <h5 class="card-title">{{ sale.product_name }} ({{ sale.amount }})</h5>
              <p v-if="sale.quality" class="card-text">Quality: {{ sale.quality }}</p>
              <p
                class="card-text"
              >Price per unit: {{ Number(sale.sellingPricePerUnit).toFixed(2) }}. (Total: {{ Number(sale.total).toFixed(2) }})</p>
            </div>
            <div class="card-footer">
              <p>Sale date: {{ sale.created_at | date }}</p>
            </div>
          </div>
        </template>
        <template v-else>
          <v-table
            class="table table-striped"
            :data="filteredSales"
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
              <v-th sortKey="category">Category</v-th>
              <v-th sortKey="amount">Amount</v-th>
              <v-th sortKey="sellingPricePerUnit">Cost/unit</v-th>
              <th>Total</th>
            </thead>
            <tbody slot="body" slot-scope="{displayData}">
              <tr v-for="sale in displayData" :key="sale.id">
                <td>{{ sale.shop_name }}</td>
                <td>{{ sale.created_at | date }}</td>
                <td>{{ sale.updated_at | date }}</td>
                <td>{{ sale.product_name }}</td>
                <td>{{ sale.quality ? sale.quality:null }}</td>
                <td>{{ sale.category_name }}</td>
                <td>{{ sale.amount }}</td>
                <td>{{ Number(sale.sellingPricePerUnit).toFixed(2) }}</td>
                <td>{{ Number(sale.total).toFixed(2) }}</td>
              </tr>
            </tbody>
          </v-table>
          <smart-pagination :currentPage.sync="currentPage" :totalPages="totalPages" />
        </template>
      </div>
    </template>
    <template v-else>
      <p>No sales recorded yet.</p>
    </template>
  </div>
</template>

<script>
import { db, fb } from "@/firebase/init";

export default {
  name: "Sales",
  data() {
    return {
      sales: [],
      search: "",
      cardView: true,
      currentPage: 1,
      totalPages: 0,
      pageSize: 5,
      range: "",
      selected: false,
      lang: {
        formatLocale: {
          firstDayOfWeek: 1
        },
        monthBeforeYear: false
      }
    };
  },
  computed: {
    filteredSales() {
      if (this.selected) {
        return this.sales.filter(sale => {
          return (
            sale.created_at >= this.range[0].getTime() / 1000 &&
            sale.created_at <= this.range[1].getTime() / 1000 + 86399
          );
        });
      }

      return this.sales.filter(sale => {
        return (
          sale.product_name.match(this.search) ||
          sale.customer_name.match(this.search) ||
          sale.shop_name.match(this.search) ||
          sale.category_name.match(this.search)
        );
      });
    }
  },
  methods: {
    confirm() {
      this.selected = true;
    },
    clear() {
      this.selected = false;
    },
    getSales(field, scope) {
      db.collection("sales")
        .where(field, "==", scope)
        .onSnapshot(snapshot => {
          this.sales = [];
          snapshot.forEach(doc => {
            //get the category name
            if (doc.exists) {
              db.collection("categories")
                .doc(doc.data().category_id)
                .get()
                .then(cat => {
                  let sale;
                  //get the shop name
                  db.collection("shops")
                    .doc(doc.data().shop_id)
                    .get()
                    .then(shop => {
                      sale = doc.data();
                      sale.id = doc.id;
                      sale.category_name = cat.data().name;
                      sale.shop_name = shop.data().name;
                      this.sales.push(sale);
                    });
                  //get customer name
                  db.collection("customers")
                    .doc(doc.data().customer_id)
                    .get()
                    .then(doc => {
                      sale.customer_name = doc.data().name;
                    });
                });
            }
          });
        });
    }
  },
  created() {
    db.collection("employees")
      .doc(fb.auth().currentUser.email)
      .get()
      .then(doc => {
        if (doc.data().admin) {
          this.getSales("company_id", doc.data().company_id);
        } else {
          this.getSales("shop_id", doc.data().shop_id);
        }
      });
  }
};
</script>