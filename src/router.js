import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    name: '404 Not Found',
    path: '/:path(.*)+',
    redirect: { name: 'index' },
  },
  {
    name: 'index',
    path: '/',
    component: () => import('./views/index'),
    meta: { title: '常州行' },
  },
  // {
  //   name: 'news',
  //   path: '/news',
  //   component: () => import('./views/news'),
  //   meta: { title: '线路公告' },
  // },
  {
    name: 'search',
    path: '/search',
    component: () => import('./views/search'),
    meta: { title: '线路搜索' },
  },
  {
    name: 'bus',
    path: '/bus',
    component: () => import('./views/bus'),
    meta: { title: '线路详情' },
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

router.beforeEach((to, from, next) => {
  const title = to?.meta?.title;
  if (title) {
    document.title = title;
  }
  next();
});

export { router };
