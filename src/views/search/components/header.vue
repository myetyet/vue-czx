<template>
  <van-sticky>
    <van-nav-bar title="线路搜索" left-arrow @click-left="back" />
  </van-sticky>
</template>

<script>
import { NavBar, Sticky } from 'vant';

export default {
  name: 'vue-czx-search-header',

  components: {
    [NavBar.name]: NavBar,
    [Sticky.name]: Sticky,
  },

  methods: {
    back: () => history.back(),
  },
};
</script>
