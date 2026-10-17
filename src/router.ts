import { createRouter, createWebHashHistory } from "vue-router";
import LibraryPage from "./pages/LibraryPage.vue";

// 用 hash 路由：GitHub Pages 没有 SPA 回退，换域名或子路径时也不用改服务器配置。
export const router = createRouter({
  history: createWebHashHistory(),
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
