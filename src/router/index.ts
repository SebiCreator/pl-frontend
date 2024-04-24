import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: () => import('../views/LandingView.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: "/login",
      name: "Login",
      component: () => import('../views/LoginView.vue')
    },
    {
      path: "/settings",
      name: "Settings",
      component: () => import('../views/SettingsView.vue')
    },
    {
      path: "/register",
      name: "Register",
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: "/stats",
      name: "Stats",
      component: () => import('../views/StatsView.vue')
    },
    {
      path: "/overview",
      name: "Overview",
      component: () => import('../views/LearningOverviewView.vue')
    },
    {
      path: "/w-questions",
      name : "welcome-questions",
      component : () => import('../views/WelcomeQuestionsView.vue')
    },
    {
      path: "/:catchAll(.*)",
      name : "Error",
      component: () => import('../views/ErrorView.vue')
    },

  ]
})

export default router
