import { createRouter, createWebHistory } from "vue-router";
import LibraryPage from "./pages/LibraryPage.vue";

// 网址里不带 #。GitHub Pages 没有 SPA 回退，构建时把 index.html 复制成 404.html 兜底。
// 旧版分享出去的 …/#/map-art 这类链接先换成普通路径再交给路由。
if (window.location.hash.startsWith("#/")) {
  window.history.replaceState(null, "", import.meta.env.BASE_URL + window.location.hash.slice(2));
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
