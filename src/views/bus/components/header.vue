<template>
  <van-sticky>
    <van-nav-bar left-arrow @click-left="back">
      <template #title>
        <van-popover v-model:show="showInfo" duration="0.1" overlay :overlay-style="{ background: 'rgba(0, 0, 0, .4)' }">
          <template #reference>
            <span v-show="infoReady">
              {{ info.name + ' ' }}
              <van-icon v-show="infoReady" :name="showInfo ? 'arrow-up' : 'arrow-down'" size="10px" />
            </span>
          </template>
          <van-cell>
            <template #value>
              <div class="vue-czx-bus-header-exchange-info">
                {{ info.starting }}&nbsp;
                <van-icon name="exchange" size="16px" color="#1989fa" @click="exchangeLineType" />
                &nbsp;{{ info.terminus }}
              </div>
            </template>
          </van-cell>
          <van-cell :title="'下一班：' + (typeof info.next === 'string' ? info.next : '暂无')" :value="`票价：${info.ticket}元`" />
        </van-popover>
      </template>
    </van-nav-bar>
  </van-sticky>
</template>

<script>
import { ref } from 'vue';
import { Cell, Icon, NavBar, Popover, Sticky } from 'vant';

export default {
  name: 'vue-czx-bus-header',

  props: {
    lineId: {
      type: String,
      default: '',
    },
    lineType: {
      type: String,
      default: '',
    },
  },

  components: {
    [Cell.name]: Cell,
    [Icon.name]: Icon,
    [NavBar.name]: NavBar,
    [Popover.name]: Popover,
    [Sticky.name]: Sticky,
  },

  data: () => ({
    showInfo: false,
  }),

  methods: {
    back: () => history.back(),
    exchangeLineType() {
      this.$router.replace({
        name: 'bus',
        query: {
          id: this.$route.query.id,
          type: String(3 - Number(this.$route.query.type)),
        },
      });
    },
  },

  setup(props) {
    const infoReady = ref(false);
    const info = ref({});
    fetch('/api/proxy', {
      body: `http://api.czjtkx.com/CzBus/V4.1/Line/GetList?Line_Id=${props.lineId}&Line_Type=${props.lineType}`,
      method: 'POST',
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.resCode === 10000 && json.value.length > 0) {
          const value = json.value[0];
          Object.assign(info.value, {
            name: value.Line_Name,
            starting: value.Start_Station_Name,
            terminus: value.End_Station_Name,
            ticket: value.Ticket,
            next: value?.Plan_Time?.slice(11, 16),
          });
          infoReady.value = true;
        } else {
          infoReady.value = false;
        }
      })
      .catch(() => infoReady.value = false);
    return { infoReady, info };
  },
};
</script>

<style scoped>
.vue-czx-bus-header-exchange-info {
  display: flex;
  align-items: center;
}
</style>
