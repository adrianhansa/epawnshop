<template>
  <div :id="productID" class="carousel slide" data-ride="carousel">
    <div class="carousel-inner">
      <div
        v-for="(image,index) in images"
        :key="index"
        class="carousel-item"
        :class="{'active':index=='0'}"
      >
        <img :src="image" class="d-block w-100" alt="image" />
      </div>
    </div>
    <a class="carousel-control-prev" :href="'#'+productID" role="button" data-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="sr-only">Previous</span>
    </a>
    <a class="carousel-control-next" :href="'#'+productID" role="button" data-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="sr-only">Next</span>
    </a>
  </div>
</template>

<script>
export default {
  name: "Carousel",
  props: ["images", "productID"]
};
</script>