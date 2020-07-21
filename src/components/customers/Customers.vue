<template>
  <div class="customers">
    <h2>Customers</h2>
    <AddCustomer />
    <EditCustomer />
    <NewPurchase />
    <button
      class="btn btn-sm btn-primary"
      @click.prevent="$modal.show('addCustomer')"
      v-if="!admin"
    >
      <i class="fas fa-user-plus"></i>
    </button>
    <input
      type="text"
      class="form-control mt-1"
      v-model="search"
      placeholder="Search for customer by name ..."
    />
    <template v-if="customers.length">
      <v-table
        class="table table-striped"
        :data="filteredCustomers"
        :currentPage.sync="currentPage"
        :pageSize="pageSize"
        @totalPagesChanged="totalPages = $event"
      >
        <thead slot="head">
          <v-th sortKey="name">Customer name</v-th>
          <v-th sortKey="created_at">Created at</v-th>
          <th>Modified at</th>
          <th v-if="admin">Shop</th>
          <th>Modify</th>
        </thead>
        <tbody slot="body" slot-scope="{displayData}">
          <tr v-for="customer in displayData" :key="customer.id">
            <td>
              {{ customer.name }}
              <button
                @click.prevent="$modal.show('newPurchase',{customer:customer})"
                class="btn btn-primary"
              >
                <i class="far fa-money-bill-alt"></i>
              </button>
            </td>
            <td>{{ customer.created_at|date }}</td>
            <td>{{ customer.updated_at|date }}</td>
            <td v-if="admin">{{ customer.shop_name }}</td>
            <td>
              <button
                @click.prevent="$modal.show('editCustomer',{customer:customer})"
                class="btn btn-success"
              >
                <i class="fas fa-user-edit"></i>
              </button>
              <button class="btn btn-danger ml-1" @click.prevent="del(customer.id)">
                <i class="fas fa-user-minus"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </v-table>
      <smart-pagination :currentPage.sync="currentPage" :totalPages="totalPages" />
    </template>
    <template v-else>
      <p>No customers</p>
    </template>
  </div>
</template>

<script>
import { fb, db } from "@/firebase/init";
import Swal from "sweetalert2/dist/sweetalert2.js";
import AddCustomer from "./AddCustomer";
import EditCustomer from "./EditCustomer";
import NewPurchase from "../purchases/NewPurchase";

export default {
  name: "Customers",
  components: { AddCustomer, EditCustomer, NewPurchase },
  data() {
    return {
      customers: [],
      admin: false,
      search: "",
      currentPage: 1,
      totalPages: 0,
      pageSize: 10
    };
  },
  computed: {
    filteredCustomers() {
      return this.customers.filter(customer => {
        return customer.name.match(this.search);
      });
    }
  },
  methods: {
    del(id) {
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
          db.collection("customers")
            .doc(id)
            .delete();
          // Swal.fire("Deleted!", "Your file has been deleted.", "success");
        }
      });
    },
    getCustomers(selectedField, selectionLevel) {
      //seletedField = shop_id or company_id from customers collection, depending if the user is a staff or admin
      //selectionLevel= shop_id or company_id from employee record of the currentUser, depending if the user is a staff or admin
      db.collection("customers")
        .where(selectedField, "==", selectionLevel)
        .onSnapshot(snapshot => {
          this.customers = [];
          snapshot.forEach(doc => {
            let customer = doc.data();
            customer.id = doc.id;
            // get shop name
            db.collection("shops")
              .doc(customer.shop_id)
              .get()
              .then(shop => {
                customer.shop_name = shop.data().name;
                this.customers.push(customer);
              });
          });
        });
    }
  },
  created() {
    db.collection("employees")
      .doc(fb.auth().currentUser.email)
      .get()
      .then(doc => {
        //if admin, all customers from all shops
        if (doc.data().admin) {
          this.admin = true;
          this.getCustomers("company_id", doc.data().company_id);
        } else {
          this.getCustomers("shop_id", doc.data().shop_id);
        }
      });
  }
};
</script>