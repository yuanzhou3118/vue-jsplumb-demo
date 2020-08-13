import Vue from 'vue';
import App from './App.vue';
import CompositionApi from '@vue/composition-api';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

require('./mock/index');
Vue.use(ElementUI, { size: 'small' });
Vue.use(CompositionApi);
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
