// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
      },
      {
        path: '/add',
        name: 'Add',
        component: () => import('@/views/Add.vue')
      },
      {
        path: '/find',
        name: 'Find',
        component: () => import('@/views/Find.vue')
      },
      {
        path: '/edit',
        name: 'Edit',
        component: () => import('@/views/Edit.vue')
      },
      {
        path: '/view',
        name: 'View',
        component: () => import('@/views/View.vue')
      },
      {
        path: '/manage/reports',
        name: 'Manage reports',
        component: () => import('@/views/manage/Reports.vue')
      },
      {
        path: '/manage/users',
        name: 'Manage Users',
        component: () => import('@/views/manage/Users.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: {
      auth: false
    }
  }

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
