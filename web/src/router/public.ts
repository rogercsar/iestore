import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '../layouts/PublicLayout.vue'
import PublicProduct from '../pages/PublicProduct.vue'

const publicRoutes = [
  {
    path: '/public',
    component: PublicLayout,
    children: [
      {
        path: 'product/:name',
        name: 'PublicProduct',
        component: PublicProduct,
        props: true
      }
    ]
  }
]

export const publicRouter = createRouter({
  history: createWebHistory(),
  routes: publicRoutes
})

export default publicRouter
