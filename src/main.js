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
// 导入富文本
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本相应的样式表
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(ElementUI);
Vue.use(ZkTable);
Vue.use(VueQuillEditor)
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

Vue.filter('dateFormat', function (val) {
  const time = new Date(val);
  const year = time.getFullYear();
  const month =
    time.getMonth() + 1 >= 10
      ? time.getMonth() + 1
      : "0" + (time.getMonth() + 1);
  const day = time.getDate() >= 10 ? time.getDate() : "0" + time.getDate();

  const hh = time.getHours() >= 10 ? time.getHours() : "0" + time.getHours();
  const mm =
    time.getMinutes() >= 10 ? time.getMinutes() : "0" + time.getMinutes;
  const ss = (time.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
})


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
