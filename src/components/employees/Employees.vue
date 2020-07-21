<template>
  <div class="employees">
    <AddEmployee />
    <EditEmployee />
    <h2>
      Employees
      <button class="btn btn-sm btn-primary" @click.prevent="$modal.show('addEmployee')">
        <i class="fas fa-user-plus"></i>
      </button>
    </h2>
    <table class="table table-striped" style="font-size:0.80em;">
      <thead class="bg-primary text-light">
        <tr>
          <th>Employee name</th>
          <th>Shop</th>
          <th>Status</th>
          <th>Admin</th>
          <th>Created at</th>
          <th>Updated at</th>
          <th>Edit/Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in employees" :key="employee.id">
          <td>{{ employee.name }}</td>
          <td>{{ employee.shop_id ? employee.shop_id:null }}</td>
          <td>{{ employee.active ? 'Active':'Inactive' }}</td>
          <td>
            {{ employee.admin ? 'Admin':'Not admin' }}
            <button
              v-if="!employee.admin"
              class="btn btn-sm btn-primary"
              @click.prevent="makeAdmin(employee.id)"
            >Make admin</button>
            <button
              v-else-if="employee.admin && !employee.owner"
              class="btn btn-sm btn-danger"
              @click.prevent="removeAdmin(employee.id)"
            >Remove admin</button>
          </td>
          <td>{{ employee.created_at|date }}</td>
          <td>{{ employee.updated_at|date }}</td>
          <td>
            <button
              v-if="!employee.owner"
              @click.prevent="editEmployee(employee)"
              class="btn btn-xs btn-success"
            >
              <i class="fas fa-user-edit"></i>
            </button>
            <button
              :disabled="employee.owner"
              class="btn btn-xs btn-danger ml-1"
              @click.prevent="del(employee)"
            >
              <i class="fas fa-user-minus"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { fb, db, functions } from "@/firebase/init";
import { mapGetters } from "vuex";
import EditEmployee from "./EditEmployee";
import AddEmployee from "./AddEmployee";
import Swal from "sweetalert2/dist/sweetalert2.js";

export default {
  name: "Employees",
  components: { EditEmployee, AddEmployee },
  data() {
    return {
      employees: []
    };
  },
  computed: {
    ...mapGetters(["user"])
  },
  methods: {
    makeAdmin(email) {
      db.collection("employees")
        .doc(fb.auth().currentUser.email)
        .get()
        .then(doc => {
          if (doc.data().admin) {
            db.collection("employees")
              .doc(email)
              .update({
                admin: true
              });
          }
        });
    },
    removeAdmin(email) {
      db.collection("employees")
        .doc(fb.auth().currentUser.email)
        .get()
        .then(doc => {
          if (doc.data().admin) {
            db.collection("employees")
              .doc(email)
              .update({
                admin: false
              });
          }
        });
    },
    del(employee) {
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
          db.collection("employees")
            .doc(employee.id)
            .delete()
            .then(() => {
              const deleteAuthUser = functions.httpsCallable("deleteAuthUser");
              deleteAuthUser({ id: employee.user_id });
            });
        }
      });
    },
    changeEmployeeStatus(employee) {
      //from active to inactive and vice-versa.
      //When is made inactive, the authentification accound needs to be disabled and vice-versa
    },
    editEmployee(employee) {
      this.$modal.show("editEmployee", { employee: employee });
    }
  },
  created() {
    //get the user from vuex
    this.$store.dispatch("user");
    //get the corresponding employee model for the authenticated user. Employee id == authenticated user's email
    db.collection("employees")
      .doc(fb.auth().currentUser.email)
      .get()
      .then(doc => {
        if (doc.data().admin) {
          db.collection("employees")
            .where("company_id", "==", doc.data().company_id)
            .onSnapshot(querySnapshot => {
              querySnapshot.docChanges().forEach(change => {
                let employee = change.doc.data();
                employee.id = change.doc.id;
                if (change.type === "added") {
                  this.employees.push(employee);
                } else if (change.type === "removed") {
                  this.employees = this.employees.filter(employee => {
                    return employee.id !== change.doc.id;
                  });
                } else if (change.type === "modified") {
                  this.employees = [];
                  db.collection("employees")
                    .where("company_id", "==", doc.data().company_id)
                    .get()
                    .then(docs => {
                      docs.forEach(doc => {
                        let employee = doc.data();
                        employee.id = doc.id;
                        this.employees.push(employee);
                      });
                    });
                }
              });
            });
        }
      });
  }
};
</script>