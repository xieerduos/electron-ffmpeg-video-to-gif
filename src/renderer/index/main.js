import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import {createPinia} from 'pinia';
import locale from 'element-plus/lib/locale/lang/zh-cn';

const pinia = createPinia();

const app = createApp(App);
// 如果您正在使用CDN引入，请删除下面一行。

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(ElementPlus, {locale});

app.use(pinia);
app.use(router);
app.mount('#app');
