import { createRouter, createWebHashHistory } from "vue-router";
import LibraryPage from "./pages/LibraryPage.vue";

// 用 hash 路由：GitHub Pages 没有 SPA 回退，换域名或子路径时也不用改服务器配置。
export const router = createRouter({
  history: createWebHashHistory(),
  // 换页回到顶部（页头随之恢复完整）；浏览器前进后退时回到原来的位置。
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
  routes: [
    { path: "/", name: "library", component: LibraryPage },
    {
      path: "/sign/:id",
      name: "sign",
      component: () => import("./pages/SignEditorPage.vue"),
      props: true,
    },
    { path: "/map-art", name: "map-art", component: () => import("./pages/MapArtPage.vue") },
  ],
});
