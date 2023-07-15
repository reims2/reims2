// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/Home.vue'),
      },
      {
        path: '/login',
        component: () => import('@/views/Login.vue'),
        meta: {
          auth: false,
          title: 'Login',
        },
      },
      { path: '/:catchAll(.*)', component: () => import('@/views/404.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/Main.vue'),
    children: [
      {
        path: '/add',
        name: 'Add',
        component: () => import('@/views/Add.vue'),
        meta: { title: 'Add' },
      },
      {
        path: '/find',
        name: 'Find',
        component: () => import('@/views/Find.vue'),
        meta: { title: 'Find' },
      },
      {
        path: '/edit',
        name: 'Edit',
        component: () => import('@/views/Edit.vue'),
        meta: { title: 'Edit' },
      },
      {
        path: '/view',
        name: 'View',
        component: () => import('@/views/View.vue'),
        meta: { title: 'View' },
      },
      {
        path: '/manage/reports',
        name: 'Manage reports',
        component: () => import('@/views/manage/Reports.vue'),
        meta: { title: 'Manage Reports' },
      },
      {
        path: '/manage/users',
        name: 'Manage Users',
        component: () => import('@/views/manage/Users.vue'),
        meta: { title: 'Manage Users' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})
router.afterEach((to) => {
  nextTick(() => {
    let title: string = 'REIMS2'
    if (to.meta.title) {
      title = `${to.meta.title} \u00B7 REIMS2`
    }
    document.title = title
  })
})

export default router
