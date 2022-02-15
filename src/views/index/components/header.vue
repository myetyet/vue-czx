<template>
  <van-sticky>
    <van-nav-bar title="常州行" @click-left="news" @click-right="search">
      <template #left>
        <van-icon name="newspaper-o" size="20px" />
      </template>
      <template #right>
        <van-icon name="search" size="20px" />
      </template>
    </van-nav-bar>
  </van-sticky>
</template>

<script>
import { Icon, NavBar, Sticky, Toast } from 'vant';

export default {
  name: 'vue-czx-index-header',

  components: {
    [Icon.name]: Icon,
    [NavBar.name]: NavBar,
    [Sticky.name]: Sticky,
    [Toast.name]: Toast,
  },

  methods: {
    news() {
      // this.$router.push({ name: 'news' });
      Toast.fail('线路公告暂未实现');
    },
    search() {
      this.$router.push({ name: 'search' });
    },
  },
};
</script>
