<template>
  <van-sticky offset-top="56px">
    <div v-if="!busesReady" class="vue-czx-bus-body-coming-placeholder" />
    <van-grid v-else :column-num="Math.max(busesComing.length, 1)" class="vue-czx-bus-body-coming-placeholder">
      <template v-if="busesComing.length === 0">
        <van-grid-item icon="underway-o" color="#1989fa" text="等待发车" />
      </template>
      <template v-else>
        <van-grid-item v-for="(bus, index) in busesComing" :key="index">
          <template v-if="stationOfInterest === bus.cur">
            <div class="vue-czx-bus-body-coming-warpper">
              <span style="font-size: 20px;">已经到站</span>
            </div>
          </template>
          <template v-else>
            <div class="vue-czx-bus-body-coming-warpper">
              <span style="font-size: 25px;">{{ stationOfInterest - bus.cur }}</span>
              <span style="font-size: var(--van-grid-item-text-font-size);">站</span>
            </div>
            <span class="van-grid-item__text" style="margin-top: var(--van-padding-xs);">{{ bus.dis + '米' }}</span>
          </template>
        </van-grid-item>
      </template>
    </van-grid>
  </van-sticky>
  <van-list v-model:loading="stationLoading" v-model:error="stationError" error-text="请求失败，点击重新加载" :finished="stationFinished" @load="loadStations" style="padding-bottom: var(--van-action-bar-height);">
    <van-cell v-for="(station, index) in stations" :key="station.id" :value="undefined" @click="updateSOI(index + 1)">
      <template #title>
        <van-badge class="vue-czx-bus-body-order-icon" :content="padding(index + 1, 2)" :color="index + 1 === stationOfInterest ? '#ff8c2f' : undefined" />
        {{ station.name }}
      </template>
      <template #label>
        <template v-if="Object.prototype.hasOwnProperty.call(buses, index + 1)">
          <div v-for="bus of buses[index + 1]" :key="bus.id" class="vue-czx-bus-body-bus-info">
            <van-icon :name="bus.arrive ? 'passed' : 'underway-o'" size="16px" />
            <span class="vue-czx-bus-body-bus-info-text">&nbsp;{{ bus.number }}({{ bus.id }}) {{ bus.arrive ? '已到站' : '正在开往' }}</span>
          </div>
        </template>
      </template>
    </van-cell>
  </van-list>
</template>

<script>
import { onUnmounted, ref } from 'vue';
import { Badge, Cell, Grid, GridItem, Icon, List, Sticky } from 'vant';
import { errorHandler } from '../../common/utils';
import emitter from '../../common/mitt';

export default {
  name: 'vue-czx-bus-body',
  
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
    [Badge.name]: Badge,
    [Cell.name]: Cell,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [Icon.name]: Icon,
    [List.name]: List,
    [Sticky.name]: Sticky,
  },

  methods: {
    padding: (x, digit) => {
      let res = String(x);
      while (res.length < digit) {
        res = '0' + res;
      }
      return res;
    },
  },

  setup: (props) => {
    const stations = ref([]);
    const stationLoading = ref(false);
    const stationError = ref(false);
    const stationFinished = ref(false);
    const buses = ref({});
    const busesReady = ref(false);
    const stationOfInterest = ref(1);
    const busesComingReady = ref(false);
    const busesComing = ref([]);

    const loadBuses = () => fetch('/api/proxy', {
      body: `http://api.czjtkx.com/CzBus/V4.1/Bus/GetList?Line_Id=${props.lineId}&Line_Type=${props.lineType}`,
      method: 'POST',
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.resCode === 10000) {
          buses.value = {};
          for (const bus of json.value) {
            const current = String(bus.Current_Station_Sort + (1 - bus.IsArrive));
            if (!Object.prototype.hasOwnProperty.call(buses.value, current)) {
              buses.value[current] = [];
            }
            buses.value[current].push({
              id: bus.BusId,
              number: bus.BusNo,
              arrive: Boolean(bus.IsArrive),
              lat: bus.LatLng.latitude,
              lng: bus.LatLng.longitude,
            });
          }
          busesReady.value = true;
          emitter.emit('vue-czx-bus-ready');
        } else {
          errorHandler(busesReady, '车辆加载失败');
        }
      })
      .catch(() => errorHandler(busesReady, '数据拉取失败'));

    const loadStations = () => fetch('/api/proxy', {
      body: `http://api.czjtkx.com/CzBus/V4.1/Station/GetListByLine?Line_Id=${props.lineId}&Line_Type=${props.lineType}`,
      method: 'POST',
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.resCode === 10000) {
          for (const station of json.value) {
            stations.value.push({
              id: station.Station_Id,
              name: station.Station_Name,
              lat: station.LatLng.latitude,
              lng: station.LatLng.longitude,
            });
          }
          stationFinished.value = true;
          loadBuses();
        } else {
          errorHandler(stationError, '线路加载失败', true);
        }
      })
      .catch(() => errorHandler(stationError, '数据拉取失败', true))
      .then(() => stationLoading.value = false);

    const updateSOI = (index) => loadBuses().then(() => {
      if (typeof index !== 'number') {
        index = stationOfInterest.value;
      } else {
        stationOfInterest.value = index;
      }
      const stationLatitude = stations.value[index - 1].lat;
      const stationLongitude = stations.value[index - 1].lng;
      const busesComingLocal = [];
      const coordinates = [];
      for (const station in buses.value) {
        if (station <= index) {
          for (const bus of buses.value[station]) {
            busesComingLocal.push({
              dis: 99999,
              cur: station - Number(!bus.arrive),
            });
            coordinates.push(`${bus.lng}%2C${bus.lat}`);
          }
        }
      }
      if (coordinates.length > 0) {
        fetch(`https://restapi.amap.com/v3/distance?origins=${coordinates.join('%7C')}&destination=${stationLongitude}%2C${stationLatitude}&type=3&key=5558dffae595e3e6eaaf41e4acf1be92`)
          .then((res) => res.json())
          .then((json) => {
            if (json.status.charCodeAt() === 49) {
              const value = json.results;
              for (let i = 0, len = busesComingLocal.length; i < len; i++) {
                busesComingLocal[i].dis = parseInt(value[i].distance);
              }
              busesComingLocal.sort((a, b) => a.dis - b.dis);
              if (busesComingLocal.length > 3) {
                busesComingLocal.length = 3;
              }
              busesComing.value = busesComingLocal;
              busesComingReady.value = true;
            } else {
              errorHandler(busesComingReady, '距离信息获取失败');
            }
          })
          .catch(() => errorHandler(busesComingReady, '数据拉取失败'));
      } else {
        busesComing.value.length = 0;
        busesComingReady.value = true;
      }
    });

    emitter.on('vue-czx-bus-refresh', updateSOI);
    onUnmounted(() => emitter.off('vue-czx-bus-refresh'));

    return {
      stations, stationLoading, stationError, stationFinished, loadStations,
      buses, busesReady, loadBuses,
      stationOfInterest, busesComingReady, busesComing, updateSOI,
    };
  },
};
</script>

<style scoped>
.vue-czx-bus-body-coming-placeholder {
  height: 86px;
  width: 100%;
}

.vue-czx-bus-body-coming-warpper {
  height: 28px;
  text-align: center;
  color: rgb(25, 137, 250);
}

.vue-czx-bus-body-order-icon {
  transform: translate(0px, 0px);
  background: rgb(25, 137, 250);
  font-size: 10px;
  line-height: 16px;
}

.vue-czx-bus-body-bus-info {
  display: flex;
  align-items: center;
}

.vue-czx-bus-body-bus-info-text {
  font-size: 10px;
}
</style>
