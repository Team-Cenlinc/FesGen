/**
 * 简体中文界面文案。
 * 界面上的所有文字都从这里取，以后加繁体和英文只需要补一份同结构的文件。
 * 牌子上的文字始终由用户填写，不属于界面文案。
 */
export const zhHans = {
  app: {
    name: "FesGen",
    tagline: "导视牌生成器",
  },
  nav: {
    label: "主导航",
    library: "作品库",
    mapArt: "地图画",
  },
  serviceDesk: {
    label: "服务台",
    appearance: "外观",
    appearanceSystem: "跟随系统",
    appearanceLight: "浅色",
    appearanceDark: "深色",
    guide: "上手指南",
    guideBody:
      "地图画工具：导入一张图片，选好地图格子，FesGen 会把它换成 Minecraft 地图色板里的颜色。下载 PNG 后用 ImageFrame 导入游戏即可。",
    about: "关于",
    aboutBody: "FesGen 是由 Cenlinc Studio 开发的导视牌生成器，属于 Fetarute 社区。",
    version: "版本",
    wiki: "Fetarute Wiki",
  },
  exit: {
    label: "出口",
    subtitle: "前往外部服务",
    website: "Fetarute 官网",
    wiki: "Fetarute Wiki",
    github: "GitHub 仓库",
  },
  library: {
    title: "作品库",
    subtitle: "Library",
    emptyTitle: "牌子编辑器正在重写",
    emptyBody: "新的编辑器还在路上。地图画管线已经可以用了，先拿现成的图片试试吧。",
    openMapArt: "打开地图画工具",
  },
  mapArt: {
    title: "地图画",
    subtitle: "Map art",
    source: {
      heading: "源图",
      choose: "选择图片",
      dropHint: "或把图片拖到这里",
      dropActive: "松开即可导入",
      replace: "换一张",
      readError: "这张图片读不出来，换一张试试。",
      unsupported: "只支持图片文件（PNG、JPG、WebP、GIF 的第一帧）。",
    },
    grid: {
      heading: "地图格子",
      rows: "行",
      columns: "列",
      custom: "自定义",
      suggested: "按图片比例推荐",
      exactMatch: "图片尺寸正好是整数张地图，不需要缩放。",
    },
    fit: {
      heading: "适配方式",
      notNeeded: "当前格子和图片尺寸一致，适配方式不起作用。",
      contain: "等比留边",
      cover: "裁切",
      stretch: "拉伸",
      padding: "留边颜色",
      paddingTransparent: "透明",
      paddingColor: "填色",
    },
    dither: {
      heading: "抖动",
      none: "不抖动",
      floydSteinberg: "Floyd–Steinberg",
      hint: "牌子这类纯色图建议不抖动；照片或渐变可以试试抖动。",
    },
    preview: {
      heading: "预览",
      mapArt: "地图画",
      original: "原图",
      gridLines: "显示分格线",
      zoom: "缩放",
      zoomFit: "适应",
      empty: "导入一张图片后，这里会显示地图画预览。",
      working: "正在换算颜色…",
    },
    stats: {
      size: "尺寸",
      maps: "地图张数",
      colors: "用到的颜色",
      transparent: "透明像素",
    },
    export: {
      heading: "导出",
      fileName: "文件名",
      download: "下载地图画 PNG",
      command: "ImageFrame 命令",
      commandHint: "把 PNG 上传到图床或 ImageFrame 内置的上传服务，再把链接填进命令。",
      mapName: "地图名称",
      imageUrl: "图片链接",
      copy: "复制",
      copied: "已复制",
    },
  },
} as const;

export type Messages = typeof zhHans;
