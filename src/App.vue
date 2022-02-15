<template>
  <div id="app">
    <router-view :key="$route.fullPath" />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

:root {
  --vue-czx-nav-bar-height: 56px;
}

.van-nav-bar__content {
  height: var(--vue-czx-nav-bar-height) !important;
}

.van-nav-bar__title {
  font-size: 18px !important;
}
</style>
