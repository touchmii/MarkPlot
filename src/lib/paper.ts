/**
 * 纸张尺寸与排版计算。所有单位均为毫米 (mm)。
 *
 * 整个应用以 mm 作为 SVG 的用户单位（user unit），即 SVG 中 1 个单位 = 1mm，
 * 配合 `<svg width="210mm" ...>` 即可保证打印出来的物理尺寸精确。
 */

export interface PaperSize {
  /** 短边（纵向时为宽度），mm */
  width: number;
  /** 长边（纵向时为高度），mm */
  height: number;
}

export const PAPER_SIZES = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  A3: { width: 297, height: 420 },
  Letter: { width: 215.9, height: 279.4 },
} as const satisfies Record<string, PaperSize>;

export type PaperName = keyof typeof PAPER_SIZES;

export type Orientation = 'portrait' | 'landscape';

export interface LayoutConfig {
  paper: PaperName;
  orientation: Orientation;
  /** 页面四周留白，mm */
  margin: number;
  /** 图块之间的间距，mm */
  gap: number;
  /**
   * 期望打印数量。0 表示「自动铺满」当前页面可容纳的最大数量。
   * 若大于自动容量，则按自动容量截断（单页）。
   */
  count: number;
  /** 是否在每个图块周围画裁切边框，便于剪裁 */
  showTileBorder: boolean;
  /** 是否显示页面裁切标记（四角 + 页面信息） */
  showPageMarks: boolean;
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  paper: 'A4',
  orientation: 'portrait',
  margin: 10,
  gap: 6,
  count: 0,
  showTileBorder: true,
  showPageMarks: true,
};

export interface TilePlacement {
  /** 图块左上角在页面坐标系中的位置，mm */
  x: number;
  y: number;
}

export interface SheetMetrics {
  /** 实际页面宽高（已考虑方向），mm */
  pageWidth: number;
  pageHeight: number;
  /** 可打印区域（去掉留白后），mm */
  innerWidth: number;
  innerHeight: number;
  cols: number;
  rows: number;
  /** 单页自动容量 */
  capacity: number;
  /** 实际放置的图块数量 */
  count: number;
  placements: TilePlacement[];
}

/** 返回考虑方向后的页面尺寸。 */
export function resolvePaper(layout: LayoutConfig): PaperSize {
  const base = PAPER_SIZES[layout.paper];
  if (layout.orientation === 'landscape') {
    return { width: base.height, height: base.width };
  }
  return { width: base.width, height: base.height };
}

/**
 * 根据图块尺寸和排版配置，计算图块在页面上的网格排列位置。
 * 图块组在可打印区域内水平、垂直居中。
 */
export function computeLayout(
  layout: LayoutConfig,
  tileWidth: number,
  tileHeight: number,
): SheetMetrics {
  const { width: pageWidth, height: pageHeight } = resolvePaper(layout);
  const innerWidth = Math.max(0, pageWidth - layout.margin * 2);
  const innerHeight = Math.max(0, pageHeight - layout.margin * 2);

  const cols = countFit(innerWidth, tileWidth, layout.gap);
  const rows = countFit(innerHeight, tileHeight, layout.gap);
  const capacity = cols * rows;

  const desired = layout.count > 0 ? Math.min(layout.count, capacity) : capacity;

  // 计算图块组的整体尺寸，使其在可打印区域内居中。
  const usedRows = Math.min(rows, Math.ceil(desired / Math.max(cols, 1)));
  const groupWidth = cols * tileWidth + (cols - 1) * layout.gap;
  const groupHeight = usedRows * tileHeight + (usedRows - 1) * layout.gap;
  const offsetX = layout.margin + Math.max(0, (innerWidth - groupWidth) / 2);
  const offsetY = layout.margin + Math.max(0, (innerHeight - groupHeight) / 2);

  const placements: TilePlacement[] = [];
  for (let i = 0; i < desired; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    placements.push({
      x: offsetX + col * (tileWidth + layout.gap),
      y: offsetY + row * (tileHeight + layout.gap),
    });
  }

  return {
    pageWidth,
    pageHeight,
    innerWidth,
    innerHeight,
    cols,
    rows,
    capacity,
    count: placements.length,
    placements,
  };
}

/** 在给定可用长度内，间距为 gap 时能容纳多少个长度为 size 的图块。 */
function countFit(available: number, size: number, gap: number): number {
  if (size <= 0 || available < size) return 0;
  // n*size + (n-1)*gap <= available  =>  n <= (available + gap) / (size + gap)
  return Math.max(0, Math.floor((available + gap) / (size + gap)));
}
