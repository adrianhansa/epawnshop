import Vue from "vue";
import Router from "vue-router";
import Home from "./components/Home.vue";
import Admin from "./components/Admin.vue";
import Shops from "./components/shops/Shops.vue";
import AddShop from "./components/shops/AddShop.vue";
import Employees from "./components/employees/Employees.vue";
import AddEmployee from "./components/employees/AddEmployee.vue";
import Categories from "./components/categories/Categories.vue";
import Customers from "./components/customers/Customers.vue";
import Purchases from "./components/purchases/Purchases.vue";
import Sales from "./components/sales/Sales.vue";
import Returns from "./components/returns/Returns.vue";
import Messages from "./components/messages/Messages.vue";
import SendMessage from './components/messages/SendMessage.vue';
import SignUpWithEmailLink from "./components/auth/SignUpWithEmailLink.vue";
import { fb } from "./firebase/init";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/signup-with-email-link",
      name: "signup-with-email-link",
      component: SignUpWithEmailLink
    },
    {
      path: "/admin",
      name: "admin",
      component: Admin,
      meta: { requiresAuth: true },
      children: [
        {
          path: "shops",
          name: "shops",
          component: Shops
        },
        {
          path: "add-shop",
          name: "add-shop",
          component: AddShop
        },
        {
          path: "employees",
          name: "employees",
          component: Employees
        },
        {
          path: "add-employee",
          name: "add-employee",
          component: AddEmployee
        },
        {
          path: "categories",
          name: "categories",
          component: Categories
        },
        {
          path: "customers",
          name: "customers",
          component: Customers
        },
        {
          path: "purchases",
          name: "purchases",
          component: Purchases
        },
        {
          path: "sales",
          name: "sales",
          component: Sales
        },
        {
          path: "returns",
          name: "returns",
          component: Returns
        },
        {
          path: "messages",
          name: "messages",
          component: Messages
        },
        {
          path: "send-message",
          name: "send-message",
          component: SendMessage
        }
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth);
  const currentUser = fb.auth().currentUser;

  if (requiresAuth && !currentUser) {
    next("/");
  } else if (requiresAuth && currentUser) {
    next();
  } else {
    next();
  }
});

export default router;
