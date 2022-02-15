<template>
  <vue-czx-bus-header :line-id="$route.query.id" :line-type="$route.query.type" />
  <vue-czx-bus-body :line-id="$route.query.id" :line-type="$route.query.type" />
  <vue-czx-bus-footer :line-id="$route.query.id" :line-type="$route.query.type" />
</template>

<script>
import vBusHeader from './components/header.vue';
import vBusBody from './components/body.vue';
import vBusFooter from './components/footer.vue';

export default {
  name: 'vue-czx-bus',

  components: {
    [vBusHeader.name]: vBusHeader,
    [vBusBody.name]: vBusBody,
    [vBusFooter.name]: vBusFooter,
  },
};
</script>
