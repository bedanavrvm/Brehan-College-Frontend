import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import CourseDetail from '../views/CourseDetail.vue'
import ModuleDetail from '../views/ModuleDetail.vue'
import LessonDetail from '../views/LessonDetail.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Account from '../views/Account.vue'
import CourseList from '../views/CourseList.vue'
import LearnView from '../views/LearnView.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
  { path: '/courses', name: 'CourseList', component: CourseList },
  { path: '/courses/:id', name: 'CourseDetail', component: CourseDetail },
  { path: '/learn/:id', name: 'LearnView', component: LearnView },
  { path: '/modules/:id', name: 'ModuleDetail', component: ModuleDetail },
  { path: '/lessons/:id', name: 'LessonDetail', component: LessonDetail },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/account', name: 'Account', component: Account },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
