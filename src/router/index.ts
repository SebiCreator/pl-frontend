import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      redirect: '/overview'
    },
    {
      path: "/newGoal",
      name: "NewGoal",
      component: () => import('../views/NewGoalView.vue')
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
      path: "/overview",
      name: "Overview",
      component: () => import('../views/LearningOverviewView.vue')
    },
    {
      path: "/newPdfGoal",
      name: "NewPdfGoal",
      component: () => import('../views/NewPdfGoalView.vue')
    },
    {
      path: "/w-questions",
      name : "welcome-questions",
      component : () => import('../views/WelcomeQuestionsView.vue')
    },
    {
      path : "/learning/:goalTopic/:subgoalTopic",
      name : "Learning",
      component : () => import('../views/LearningView.vue')
    },
    {
      path : "/goal/:topic",
      name : "Goal",
      component : () => import('../views/GoalView.vue')
    },
    {
      path: "/:catchAll(.*)",
      name : "Error",
      component: () => import('../views/ErrorView.vue')
    },


  ]
})

export default router
