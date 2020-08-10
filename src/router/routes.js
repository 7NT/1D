const routes = [{
  path: '/',
  component: () => import('layouts/MainLayout.vue'),
  children: [{
    path: '',
    component: () => import('pages/Index.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('pages/Home')
  },
  {
    path: '/tops',
    name: 'tops',
    component: () => import('pages/Tops')
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('pages/SignIn')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('pages/SignIn')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('pages/Profile'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/lobby',
    name: 'lobby',
    component: () => import('pages/Lobby'),
    meta: {
      requiresAuth: true
    }
  }
  ]
}]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
