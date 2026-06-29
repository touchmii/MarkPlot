import type { AnyGenerator } from '../generators/types';
import type { LayoutConfig, SheetMetrics } from '../lib/paper';

/** 出图 SVG 的固定 id，供打印与导出定位。 */
export const SHEET_SVG_ID = 'markplot-sheet';

function fmt(n: number): string {
  return parseFloat(n.toFixed(3)).toString();
}

interface SheetPreviewProps {
  generator: AnyGenerator;
  config: unknown;
  layout: LayoutConfig;
  /** 由父组件预先计算好的排版结果 */
  metrics: SheetMetrics;
}

/**
 * 把若干图块按排版配置铺到一张纸上，输出为一个按 mm 精确定尺的 SVG。
 *
 * 该 SVG 同时用于屏幕预览、浏览器打印和导出，做到所见即所得。
 */
export function SheetPreview({ generator, config, layout, metrics }: SheetPreviewProps) {
  const tile = generator.getTileSize(config);
  const { pageWidth, pageHeight, placements } = metrics;
  const Tile = generator.Tile;

  return (
    <svg
      id={SHEET_SVG_ID}
      xmlns="http://www.w3.org/2000/svg"
      width={`${pageWidth}mm`}
      height={`${pageHeight}mm`}
      viewBox={`0 0 ${fmt(pageWidth)} ${fmt(pageHeight)}`}
      className="sheet"
    >
      {/* 纸张背景（导出为独立文件时保证白底） */}
      <rect x={0} y={0} width={pageWidth} height={pageHeight} fill="#ffffff" />

      {placements.map((p, i) => (
        <svg
          key={i}
          x={fmt(p.x)}
          y={fmt(p.y)}
          width={fmt(tile.width)}
          height={fmt(tile.height)}
          viewBox={`0 0 ${fmt(tile.width)} ${fmt(tile.height)}`}
        >
          {layout.showTileBorder && (
            <rect
              x={0.05}
              y={0.05}
              width={tile.width - 0.1}
              height={tile.height - 0.1}
              fill="none"
              stroke="#d0d0d0"
              strokeWidth={0.12}
              strokeDasharray="1 1"
            />
          )}
          <Tile config={config} />
        </svg>
      ))}

      {layout.showPageMarks && <PageMarks layout={layout} metrics={metrics} generatorName={generator.name} />}
    </svg>
  );
}

/** 页面四角裁切标记 + 底部信息栏。 */
function PageMarks({
  layout,
  metrics,
  generatorName,
}: {
  layout: LayoutConfig;
  metrics: SheetMetrics;
  generatorName: string;
}) {
  const { pageWidth, pageHeight, count } = metrics;
  const m = layout.margin;
  const len = 4; // 标记线长度 mm
  const corners = [
    { x: m, y: m, dx: 1, dy: 1 },
    { x: pageWidth - m, y: m, dx: -1, dy: 1 },
    { x: m, y: pageHeight - m, dx: 1, dy: -1 },
    { x: pageWidth - m, y: pageHeight - m, dx: -1, dy: -1 },
  ];
  return (
    <g stroke="#9aa0a6" strokeWidth={0.15} fill="none">
      {corners.map((c, i) => (
        <path
          key={i}
          d={`M${fmt(c.x)} ${fmt(c.y + c.dy * len)}L${fmt(c.x)} ${fmt(c.y)}L${fmt(
            c.x + c.dx * len,
          )} ${fmt(c.y)}`}
        />
      ))}
      <text
        x={pageWidth / 2}
        y={pageHeight - 3}
        fontSize={2.6}
        fill="#9aa0a6"
        textAnchor="middle"
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {`MarkPlot · ${generatorName} · ${layout.paper} · ${count} 个`}
      </text>
    </g>
  );
}
