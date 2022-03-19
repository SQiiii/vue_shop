import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
// 导入全局样式表
import './assets/css/global.css'
// 导入树形表格
import ZkTable from 'vue-table-with-tree-grid'

Vue.use(ElementUI);
Vue.use(ZkTable);
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 挂载到 vue 原型上,使得每个组件均可通过 this 访问 $http 发起ajax请求
Vue.prototype.$http = axios;
Vue.config.productionTip = false


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
