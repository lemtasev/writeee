import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/views/Home').default
    },
    {
      path: '/Welcome',
      name: '/Welcome',
      component: require('@/views/Welcome').default
    },
    {
      path: '/Setting',
      name: '/Setting',
      component: require('@/views/Setting').default
    },
    {
      path: '/Search',
      name: '/Search',
      component: require('@/views/Search').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
