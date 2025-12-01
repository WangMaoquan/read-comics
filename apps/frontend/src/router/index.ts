import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@views/Home.vue'),
    meta: {
      title: '首页',
    },
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@views/Auth.vue'),
    meta: {
      title: '登录/注册',
    },
  },
  {
    path: '/library',
    name: 'Library',
    component: () => import('@views/Library.vue'),
    meta: {
      title: '漫画库',
    },
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@views/Favorites.vue'),
    meta: {
      title: '我的书架',
    },
  },
  {
    path: '/comic/:id',
    name: 'ComicDetail',
    component: () => import('@views/ComicDetail.vue'),
    meta: {
      title: '漫画详情',
    },
  },
  {
    path: '/reader/:comicId/:chapterId',
    name: 'Reader',
    component: () => import('@views/Reader.vue'),
    meta: {
      title: '阅读器',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@views/Settings.vue'),
    meta: {
      title: '设置',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@views/NotFound.vue'),
    meta: {
      title: '页面未找到',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 漫画阅读器`
    : '漫画阅读器';
  next();
});

export default router;
