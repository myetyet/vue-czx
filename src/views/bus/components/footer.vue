<template>
  <van-action-bar style="justify-content: space-evenly;">
      <van-action-bar-icon :icon="isFavorite ? 'star' : 'star-o'" :text="isFavorite ? '已收藏' : '收藏'" :color="isFavorite ? '#ff5000' : undefined" @click="inverseFavoriteStatus" />
      <van-action-bar-icon :text="busesRefreshing ? '正在刷新' : '刷新'" @click="refreshBuses">
        <template #icon>
          <van-icon name="replay" :class="busesRefreshing ? 'vue-czx-bus-footer-icon-rotate' : undefined" />
        </template>
      </van-action-bar-icon>
      <van-action-bar-icon icon="todo-list-o" text="今日班次" @click="showPlans = true" />
      <van-action-bar-icon icon="ellipsis" text="更多" @click="showMore = true"/>
    </van-action-bar>
    <van-action-sheet v-model:show="showPlans" title="今日班次" style="height: 50%">
      <template v-if="plansReady && plans.length > 0">
        <van-row v-for="(group, index) in plans" :key="index" class="vue-czx-bus-footer-row">
          <van-col v-for="plan in group" :key="plan" span="4" class="vue-czx-bus-footer-col">
            <van-tag plain type="primary" size="large" color="var(--van-tag-primary-color)" text-color="black">{{ plan }}</van-tag>
          </van-col>
        </van-row>
      </template>
      <template v-else>
        <van-cell>
          <template #value>
            <div style="text-align: center;">{{ plansReady ? '今日已无班次' : '数据拉取失败，请刷新页面' }}</div>
          </template>
        </van-cell>
      </template>
    </van-action-sheet>
    <van-action-sheet v-model:show="showMore" cancel-text="取消">
      <van-cell title="刷新间隔" style="height: 48px;">
        <template #value>
          <div v-if="showStepper" class="vue-czx-bus-footer-stepper-warpper">
            <van-stepper v-model="refreshIntervalValue" min="8" max="30" />
            &nbsp;&nbsp;<van-icon name="success" size="18px" @click.stop="intervalSet" />
            &nbsp;<van-icon name="cross" size="18px" @click.stop="intervalCancel" />
          </div>
          <div v-else @click="showStepper = true" class="van-cell__value">{{ refreshInterval }} 秒</div>
        </template>
      </van-cell>
    </van-action-sheet>
</template>

<script>
import { onUnmounted, ref } from 'vue';
import { ActionBar, ActionBarIcon, ActionSheet, Cell, CellGroup, Col, Icon, Row, Stepper, Tag } from 'vant';
import { errorHandler } from '../../common/utils';
import emitter from '../../common/mitt';

export default {
  name: 'vue-czx-bus-footer',

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
    [ActionBar.name]: ActionBar,
    [ActionBarIcon.name]: ActionBarIcon,
    [ActionSheet.name]: ActionSheet,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Col.name]: Col,
    [Icon.name]: Icon,
    [Row.name]: Row,
    [Stepper.name]: Stepper,
    [Tag.name]: Tag,
  },

  data() {
    return {
      isFavorite: (localStorage.getItem('vue-czx-favorites') ?? '').includes(`${this.lineId}_${this.lineType}`),
      showPlans: false,
      showMore: false,
    };
  },

  methods: {
    inverseFavoriteStatus() {
      const lineStr = `${this.$route.query.id}_${this.$route.query.type}`;
      let favoriteStr = localStorage.getItem('vue-czx-favorites') ?? '';
      if (this.isFavorite) {
        favoriteStr = favoriteStr.replace(lineStr, '').replace(',,', ',').replace(/(^,|,$)/, '');
        this.isFavorite = false;
      } else {
        favoriteStr = `${favoriteStr},${lineStr}`.replace(/^,/, '');
        this.isFavorite = true;
      }
      localStorage.setItem('vue-czx-favorites', favoriteStr);
    },
  },

  setup(props) {
    const plans = ref([]);
    const plansReady = ref(false);
    fetch('/api/proxy', {
      body: `http://api.czjtkx.com/CzBus/V4.1/Line/GetDayPlanTime?Line_Id=${props.lineId}&Line_Type=${props.lineType}`,
      method: 'POST',
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.resCode === 10000) {
          const value = json.value;
          for (let i = 0, len = value.length; i * 6 < len; i++) {
            plans.value.push([]);
            for (let j = i * 6, end = Math.min((i + 1) * 6, len); j < end; j++) {
              plans.value[i].push(value[j].Plan_Time.slice(11, 16));
            }
          }
          plansReady.value = true;
        } else {
          errorHandler(plansReady, '今日班次加载失败');
        }
      })
      .catch(() => errorHandler(plansReady, '数据拉取失败'));

    const busesRefreshing = ref(false);
    const refreshBuses = () => {
      if (!busesRefreshing.value) {
        emitter.emit('vue-czx-bus-refresh');
        busesRefreshing.value = true;
        setTimeout(() => busesRefreshing.value = false, 1500);
      }
    };

    let refreshIntervalLocal = parseInt(localStorage.getItem('vue-czx-refresh'));
    if (isNaN(refreshIntervalLocal)) {
      refreshIntervalLocal = 8;
    } else {
      refreshIntervalLocal = Math.max(8, refreshIntervalLocal);
    }
    localStorage.setItem('vue-czx-refresh', refreshIntervalLocal);
    const showStepper = ref(false);
    const refreshInterval = ref(refreshIntervalLocal);
    const refreshIntervalValue = ref(refreshIntervalLocal);
    const intervalHandle = ref(-1);
    const intervalStart = () => {
      if (intervalHandle.value > -1) {
        clearInterval(intervalHandle.value);
      }
      intervalHandle.value = setInterval(() => refreshBuses(), refreshInterval.value * 1000);
    }
    const intervalSet = () => {
      refreshInterval.value = refreshIntervalValue.value;
      localStorage.setItem('vue-czx-refresh', refreshIntervalValue.value);
      showStepper.value = false;
      refreshBuses();
      intervalStart();
    };
    const intervalCancel = () => {
      refreshIntervalValue.value = refreshInterval.value;
      showStepper.value = false;
    };
    emitter.on('vue-czx-bus-ready', () => intervalStart());
    onUnmounted(() => {
      clearInterval(intervalHandle.value);
      emitter.off('vue-czx-bus-ready');
    });

    return {
      plans, plansReady,
      busesRefreshing, refreshBuses,
      showStepper, refreshInterval, refreshIntervalValue, intervalSet, intervalCancel, intervalHandle,
    };
  },
};
</script>

<style scoped>
.vue-czx-bus-footer-icon-rotate {
  transform: rotate(360deg);
  transition: transform 1.5s;
  color: rgb(25, 137, 250);
}

.vue-czx-bus-footer-row {
  margin: 10px 5px;
}

.vue-czx-bus-footer-col {
  text-align: center;
}

.vue-czx-bus-footer-stepper-warpper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
