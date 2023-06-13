import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import {createPinia} from 'pinia';
import locale from 'element-plus/lib/locale/lang/zh-cn';
import VXETable from 'vxe-table';
import 'vxe-table/lib/style.css';
import './styles/index.scss';
const pinia = createPinia();

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(ElementPlus, {locale});

app.use(VXETable);
app.use(pinia);
app.use(router);
app.mount('#app');
