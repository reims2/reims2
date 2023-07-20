// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
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
  history: createWebHistory(process.env.BASE_URL),
  routes,
})
router.beforeEach((to) => {
  const authStore = useAuthStore()
  // We set a flag for disabling login redirect while running CI tests
  const shouldRedirect = import.meta.env.VITE_REDIRECT_UNAUTHENTICATED !== 'false'
  if (!authStore.isLoggedIn && shouldRedirect) {
    if (to.meta.auth === undefined || (to.meta.auth && to.name !== 'Login')) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }
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
