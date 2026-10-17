import "@fontsource-variable/noto-sans-display";
import "@fontsource-variable/noto-sans-sc";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/site-header.css";

import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import { applyNavigationSignal } from "./header/navigationSignal";
import { router } from "./router";

// 挂载前写好本会话的导航线路色，首帧就是最终颜色。
applyNavigationSignal();

createApp(App).use(createPinia()).use(router).mount("#app");
