import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    // false marks a public route
    auth?: boolean
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/StartPage.vue'),
        meta: {
          auth: false,
        },
      },
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginPage.vue'),
        meta: {
          auth: false,
          title: 'Login',
        },
      },
      { path: '/:catchAll(.*)', component: () => import('@/views/404Error.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/ReimsLayout.vue'),
    children: [
      {
        path: '/add',
        name: 'Add',
        component: () => import('@/views/AddGlasses.vue'),
        meta: { title: 'Add glasses' },
      },
      {
        path: '/find',
        name: 'Find',
        component: () => import('@/views/FindGlasses.vue'),
        meta: { title: 'Find glasses' },
      },
      {
        path: '/edit',
        name: 'Edit',
        component: () => import('@/views/EditGlasses.vue'),
        meta: { title: 'Edit glasses' },
      },
      {
        path: '/view',
        name: 'View',
        component: () => import('@/views/ViewGlasses.vue'),
        meta: { title: 'View all glasses' },
      },
      {
        path: '/manage/reports',
        name: 'Manage reports',
        component: () => import('@/views/ManageReports.vue'),
        meta: { title: 'Manage Reports' },
      },
      {
        path: '/manage/users',
        name: 'Manage Users',
        component: () => import('@/views/ManageUsers.vue'),
        meta: { title: 'Manage Users' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn && to.meta.auth !== false) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})
router.afterEach((to) => {
  nextTick(() => {
    let title = 'REIMS2'
    if (to.meta.title) {
      title = `${to.meta.title} \u00B7 REIMS2`
    }
    document.title = title
  })
})

export default router
