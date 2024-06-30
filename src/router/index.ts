import { createRouter, createWebHistory } from 'vue-router'
import { useUserDataStore } from "../store/userDataStore.js";





const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landing',
      redirect: '/overview'
    },
    {
      path: "/codeReview/:sessionId",
      name: "CodeReview",
      component: () => import('../views/CodeReviewView.vue')
    },
    {
      path: "/codeReview",
      name: "CodeReview",
      component: () => import('../views/CodeReviewView.vue')
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
      path: "/welcome",
      name: "welcome-questions",
      component: () => import('../views/WelcomeQuestionsView.vue')
    },
    {
      path: "/learning/:goalTopic/:subgoalTopic",
      name: "Learning",
      component: () => import('../views/LearningView.vue')
    },
    {
      path: "/goal/:topic",
      name: "Goal",
      component: () => import('../views/GoalView.vue')
    },
    {
      path: "/:catchAll(.*)",
      name: "Error",
      component: () => import('../views/ErrorView.vue')
    },


  ]
})


router.beforeEach(async(to, from, next) => {
  const userDataStore = useUserDataStore();
  await userDataStore.loadAll({ email : "test@test.de"})
  const preferencesDone = userDataStore.preferences
  const nameDone = userDataStore.userPersonalData.name
  const languageDone = userDataStore.userPersonalData.language
  const occupationDone = userDataStore.userPersonalData.occupation
  if (to.path == "/welcome") {
    next();
  } else
    if (occupationDone && languageDone && nameDone && preferencesDone) { next(); }
    else {
      next('/welcome');
    }
});

export default router
