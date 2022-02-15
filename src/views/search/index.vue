<template>
  <vue-czx-search-header />
  <vue-czx-search-body />
</template>

<script>
import vSearchHeader from './components/header.vue';
import vSearchBody from './components/body.vue';

export default {
  name: 'vue-czx-search',

  components: {
    [vSearchHeader.name]: vSearchHeader,
    [vSearchBody.name]: vSearchBody,
  },

  beforeRouteLeave: (to, from, next) => {
    if (to.name === 'index') {
      delete window['vue-czx-search'];
    }
    next();
  },
};
</script>
