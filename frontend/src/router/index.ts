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
        component: () => import('@/view/Add.vue')
      },
      {
        path: '/find',
        name: 'Find',
        component: () => import('@/view/Find.vue')
      },
      {
        path: '/edit',
        name: 'Edit',
        component: () => import('@/view/Edit.vue')
      },
      {
        path: '/view',
        name: 'View',
        component: () => import('@/view/View.vue')
      },
      {
        path: '/manage/reports',
        name: 'Manage reports',
        component: () => import('@/view/manage/Reports.vue')
      },
      {
        path: '/manage/users',
        name: 'Manage Users',
        component: () => import('@/view/manage/Users.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/pages/Login.vue'),
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
