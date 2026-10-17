import { MAP_TILE_SIZE } from "./palette";

export interface Size {
  width: number;
  height: number;
}

/** 地图格子：rows 行 × columns 列，例如 1×3 是 1 行 3 列（384×128 像素）。 */
export interface MapGrid {
  rows: number;
  columns: number;
}

/** 单边最多的地图张数，防止误填出一面巨墙。 */
export const MAX_GRID_SIDE = 16;

export const GRID_PRESETS: readonly MapGrid[] = [
  { rows: 1, columns: 1 },
  { rows: 1, columns: 2 },
  { rows: 1, columns: 3 },
  { rows: 1, columns: 4 },
  { rows: 2, columns: 2 },
  { rows: 2, columns: 3 },
  { rows: 2, columns: 4 },
];

export function gridLabel(grid: MapGrid): string {
  return `${grid.rows}×${grid.columns}`;
}

export function gridPixelSize(grid: MapGrid): Size {
  return { width: grid.columns * MAP_TILE_SIZE, height: grid.rows * MAP_TILE_SIZE };
}

export function sameGrid(a: MapGrid, b: MapGrid): boolean {
  return a.rows === b.rows && a.columns === b.columns;
}

export function clampGridSide(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_GRID_SIDE, Math.max(1, Math.round(value)));
}

/** 图片尺寸正好是整数张地图时返回对应格子，不需要任何缩放。 */
export function exactGrid(size: Size): MapGrid | null {
  if (size.width % MAP_TILE_SIZE !== 0 || size.height % MAP_TILE_SIZE !== 0) return null;
  const grid = { rows: size.height / MAP_TILE_SIZE, columns: size.width / MAP_TILE_SIZE };
  return grid.rows <= MAX_GRID_SIDE &&
    grid.columns <= MAX_GRID_SIDE &&
    grid.rows > 0 &&
    grid.columns > 0
    ? grid
    : null;
}

/**
 * 按图片比例推荐格子：先找宽高比最接近的，比例差不多时选地图张数更少的，
 * 因为每张地图都是服务器上的一件物品。旧版默认的 600×200 会得到 1×3。
 */
export function suggestGrid(size: Size, maxRows = 4, maxColumns = 8): MapGrid {
  const exact = exactGrid(size);
  if (exact && exact.rows <= maxRows && exact.columns <= maxColumns) return exact;

  const target = Math.log(size.width / size.height);
  const candidates: { grid: MapGrid; error: number }[] = [];
  for (let rows = 1; rows <= maxRows; rows++) {
    for (let columns = 1; columns <= maxColumns; columns++) {
      candidates.push({
        grid: { rows, columns },
        error: Math.abs(Math.log(columns / rows) - target),
      });
    }
  }
  const bestError = Math.min(...candidates.map((candidate) => candidate.error));
  const tolerance = 0.03;
  const acceptable = candidates.filter((candidate) => candidate.error <= bestError + tolerance);
  acceptable.sort(
    (a, b) => a.grid.rows * a.grid.columns - b.grid.rows * b.grid.columns || a.error - b.error,
  );
  return acceptable[0]!.grid;
}
