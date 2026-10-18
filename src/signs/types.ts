import type { FontId } from "@/fonts/stacks";
import type { TextShaper } from "@/fonts/shaper";
import type { FitMode } from "@/mapart/fit";
import type { MapGrid, Size } from "@/mapart/grid";
import type { RenderTree } from "./render";

/** 已实现的牌子样式。FTA 两种重做完再加进来。 */
export type SignStyleId = "kitajuku-dentetsu";

/** 灯光效果：通过改背景实现的灯箱美化与仿真。 */
export type Lighting = "none" | "fluore" | "led";

/** 尺寸：地图格（每格 128px）或自由像素。 */
export type SignSize =
  { mode: "grid"; grid: MapGrid } | { mode: "free"; width: number; height: number };

/** 用户对单个模块的微调。偏移以 200px 高的设计基准计，换尺寸时随牌子一起缩放。 */
export interface ModuleTweak {
  dx: number;
  dy: number;
  /** 1 为原大小。 */
  scale: number;
  hidden: boolean;
}

/** 地图画输出设置。gridForFree 只在自由尺寸下使用。 */
export interface MapArtSettings {
  gridForFree: MapGrid;
  fit: FitMode;
  /** 地图画默认不带灯光；打开后只对背景层抖动。 */
  applyLighting: boolean;
}

/** 作品库里的一块牌子。 */
export interface SignDocument<C = unknown> {
  id: string;
  name: string;
  style: SignStyleId;
  size: SignSize;
  lighting: Lighting;
  content: C;
  tweaks: Record<string, ModuleTweak>;
  mapArt: MapArtSettings;
  createdAt: number;
  updatedAt: number;
  /** 作品库缩略图（PNG data URL），在编辑器里保存时生成，作品库因此不必加载字体。 */
  thumbnail?: string;
}

/** 属性面板的字段描述；path 是内容对象里的点路径，例如 "station.chinese"。 */
export type FieldDef =
  | { type: "text"; path: string; label: string; placeholder?: string }
  | { type: "color"; path: string; label: string }
  | { type: "toggle"; path: string; label: string }
  | { type: "number"; path: string; label: string; min: number; max: number; unit?: string }
  | {
      type: "choice";
      path: string;
      label: string;
      options: readonly { value: string; label: string }[];
    }
  /** 选项多、放不进分段选择时用下拉框。 */
  | {
      type: "select";
      path: string;
      label: string;
      options: readonly { value: string; label: string }[];
    }
  /**
   * 列表（例如 FTA 的线路）：可以在任意位置插入、删除、调整顺序。
   * fields 里的 path 相对于单个列表项；itemTitle 是列表项标题里显示的字段。
   */
  | {
      type: "list";
      path: string;
      label: string;
      itemLabel: string;
      itemTitle: readonly string[];
      fields: readonly ConditionalField[];
      min: number;
    };

/**
 * 字段只在另一个开关打开时出现，例如“第二条色带颜色”。
 * visibleWhen 写成“path=value”时，表示那个字段等于这个值才出现。
 */
export type ConditionalField = FieldDef & { visibleWhen?: string };

export interface ActionDef {
  id: string;
  label: string;
}

export interface RegionDef {
  id: string;
  label: string;
}

export interface ModuleDef {
  id: string;
  label: string;
  region: string;
  fields: readonly ConditionalField[];
  actions?: readonly ActionDef[];
}

export interface LayoutInput<C> {
  content: C;
  size: Size;
  shaper: TextShaper;
  tweaks: Readonly<Record<string, ModuleTweak>>;
}

/** 从旧版 Vue 2 导出的 JSON（beta-v0.1.1）迁移出来的结果。 */
export interface LegacyMigration<C> {
  content: C;
  size: SignSize;
  lighting: Lighting;
}

/** 一种牌子样式：默认值、分区与模块、字体依赖、排版函数和旧文件迁移。 */
export interface SignStyle<C> {
  id: SignStyleId;
  label: string;
  description: string;
  defaultSize: SignSize;
  regions: readonly RegionDef[];
  modules: readonly ModuleDef[];
  globalFields: readonly ConditionalField[];
  globalActions: readonly ActionDef[];
  defaults(): C;
  /** 补齐缺失字段、纠正类型，任何来源的数据都先过这一步。 */
  normalize(raw: unknown): C;
  /** 这份内容需要的字体（例如打开汉字强调才需要粗体）。 */
  fonts(content: C): FontId[];
  layout(input: LayoutInput<C>): RenderTree;
  applyAction(content: C, actionId: string): C;
  /** 列表字段新加一项时的默认值（例如新线路取一个还没用过的预设色）。 */
  newListItem?(content: C, path: string): unknown;
  /** 作品名默认取什么（导入旧文件时用），例如本站名。 */
  title?(content: C): string;
  fromLegacy(legacy: Record<string, unknown>): LegacyMigration<C>;
}
