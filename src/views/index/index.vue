<template>
  <vue-czx-index-header />
  <vue-czx-index-body />
</template>

<script>
import vIndexHeader from './components/header.vue';
import vIndexBody from './components/body.vue';

export default {
  name: 'vue-czx-index',

  components: {
    [vIndexHeader.name]: vIndexHeader,
    [vIndexBody.name]: vIndexBody,
  },
};
</script>
