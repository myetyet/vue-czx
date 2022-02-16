<template>
  <van-cell-group title="线路收藏">
    <van-list v-model:linesLoading="linesLoading" v-model:error="linesError" error-text="请求失败，点击重新加载" :finished="linesFinished" finished-text="没有更多了" @load="loadLines">
      <van-swipe-cell v-for="line in favorites" :key="`${line.id}_${line.type}`">
        <van-cell :title="line.name" :label="'开往 ' + line.to" center is-link :to="{ name: 'bus', query: { id: line.id, type: line.type } }" />
        <template #right>
          <van-button square text="取消收藏" type="danger" style="height: 100%;" @click="removeFromFavorites(line.id, line.type)" />
        </template>
      </van-swipe-cell>
    </van-list>
  </van-cell-group>
</template>

<script>
import { ref } from 'vue';
import { Button, Cell, CellGroup, List, SwipeCell } from 'vant';
import { errorHandler } from '../../common/utils';

export default {
  name: 'vue-czx-index-body',

  components: {
    [Button.name]: Button,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [List.name]: List,
    [SwipeCell.name]: SwipeCell,
  },

  setup: () => {
    const favorites = ref([]);
    const linesLoading = ref(false);
    const linesError = ref(false);
    const linesFinished = ref(false);

    const fetchLine = (id, type) => fetch('/api/proxy', {
      body: `http://api.czjtkx.com/CzBus/V4.1/Line/GetList?Line_Id=${id}&Line_Type=${type}`,
      method: 'POST',
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.resCode === 10000) {
          const line = json.value[0];
          favorites.value.push({
            id,
            type,
            name: line.Line_Name,
            to: line.End_Station_Name,
          });
        } else {
          errorHandler(linesError, '部分线路获取失败', true);
        }
      })
      .catch(() => errorHandler(linesError, '数据拉取失败', true));
    const loadLines = () => {
      let fetchChain = Promise.resolve();
      const favoriteStr = localStorage.getItem('vue-czx-favorites') ?? '';
      if (favoriteStr.length > 0) {
        for (const lineStr of favoriteStr.split(',')) {
          const [lineId, lineType] = lineStr.split('_');
          fetchChain = fetchChain.then(() => fetchLine(lineId, lineType));
        }
      }
      fetchChain.finally(() => {
        linesLoading.value = false;
        linesFinished.value = true;
      });
    };

    const removeFromFavorites = (id, type) => {
      const lineStr = `${id}_${type}`;
      let favoriteStr = localStorage.getItem('vue-czx-favorites') ?? '';
      favoriteStr = favoriteStr.replace(lineStr, '').replace(',,', ',').replace(/(^,|,$)/, '');
      localStorage.setItem('vue-czx-favorites', favoriteStr);
      for (let i = 0, len = favorites.value.length; i < len; i++) {
        if (favorites.value[i].id === id && favorites.value[i].type === type) {
          favorites.value.splice(i, 1);
          break;
        }
      }
    };

    return { favorites, linesLoading, linesError, linesFinished, loadLines, removeFromFavorites };
  },
};
</script>
