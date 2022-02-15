<template>
  <van-search v-model="keyword" placeholder="搜索线路" @search="searchLines" />
  <van-list v-model:loading="searchLoading" v-model:error="searchError" error-text="请求失败，点击重新加载" :finished="searchFinished" @load="loadLines">
      <van-cell v-for="line in searchResults" :key="`${line.id}_${line.type}`" :title="line.name" :label="'开往 ' + line.to" center is-link :to="{ name: 'bus', query: { id: line.id, type: line.type } }" />
  </van-list>
</template>

<script>
import { ref } from 'vue';
import { Cell, List, Search } from 'vant';
import { errorHandler } from '../../common/utils';

export default {
  name: 'vue-czx-search-body',

  components: {
    [Cell.name]: Cell,
    [List.name]: List,
    [Search.name]: Search,
  },

  setup: () => {
    const keyword = ref('');
    const searchResults = ref([]);
    const searchLoading = ref(false);
    const searchError = ref(false);
    const searchFinished = ref(true);

    const loadLines = () => {
      if (keyword.value.length > 0) {
        fetch('/api/proxy', {
          body: `http://api.czjtkx.com/CzBus/V4.1/Line/GetList?Line_Name=${keyword.value}`,
          method: 'POST',
        })
          .then((res) => res.json())
          .then((json) => {
            if (json.resCode === 10000) {
              searchResults.value.length = 0;
              for (const line of json.value) {
                searchResults.value.push({
                  id: line.Line_Id,
                  type: line.Line_Type,
                  name: line.Line_Name,
                  to: line.End_Station_Name,
                });
              }
              if (!Object.prototype.hasOwnProperty.call(window, 'vue-czx-search')) {
                window['vue-czx-search'] = {};
              }
              Object.assign(window['vue-czx-search'], {
                keyword: keyword.value,
                searchResults: searchResults.value,
              });
            } else {
              errorHandler(searchError, '搜索失败', true);
            }
          })
          .catch(() => errorHandler(searchError, '数据拉取失败', true))
          .then(() => {
            searchLoading.value = false;
            searchFinished.value = true;
          });
      }
    };

    const searchLines = () => {
      if (keyword.value.length > 0) {
        searchLoading.value = true;
        searchFinished.value = false;
        loadLines();
      }
    };

    const searchCache = window['vue-czx-search'] ?? {};
    if (typeof searchCache.keyword === 'string' && searchCache.searchResults instanceof Array) {
      keyword.value = searchCache.keyword;
      searchResults.value = searchCache.searchResults;
    }

    return { keyword, searchResults, searchLoading, searchError, searchFinished, loadLines, searchLines };
  },
};
</script>
