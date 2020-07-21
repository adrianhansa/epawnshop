<template>
  <div class="home">
    <Navbar />
    <h1>Home</h1>
    <Login />
    <Register />
  </div>
</template>

<script>
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
export default {
  name: "home",
  components: { Login, Register }
};
</script>
