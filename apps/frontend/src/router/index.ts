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
      requiresAuth: true, // 需要登录
    },
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@views/Tags.vue'),
    meta: {
      title: '标签浏览',
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

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token');
  const isAuthenticated = !!token;

  // 如果未登录且访问的不是登录页，重定向到登录页
  if (to.path !== '/auth' && !isAuthenticated) {
    next({
      path: '/auth',
      query: { redirect: to.fullPath },
    });
  } else if (to.path === '/auth' && isAuthenticated) {
    // 已登录用户访问登录页，重定向到首页
    next('/');
  } else {
    next();
  }
});

export default router;
