import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { GENERATORS, DEFAULT_GENERATOR_ID, getGenerator } from './generators/registry';
import { SheetPreview } from './layout/SheetPreview';
import { computeLayout, DEFAULT_LAYOUT, type LayoutConfig } from './lib/paper';
import { LayoutForm } from './layout/LayoutForm';
import { exportPng, exportSvg, printSheet } from './export/exporters';
import { SelectField } from './components/fields';

const MM_TO_PX = 96 / 25.4; // CSS 像素与毫米的换算（96dpi）

export default function App() {
  const [generatorId, setGeneratorId] = useState(DEFAULT_GENERATOR_ID);

  // 为每个生成器各自保存一份配置，切换类型时互不影响。
  const [configs, setConfigs] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const g of GENERATORS) initial[g.id] = g.createDefault();
    return initial;
  });

  const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT);
  const [zoom, setZoom] = useState(0.7);
  const [busy, setBusy] = useState(false);

  const generator = getGenerator(generatorId) ?? GENERATORS[0];
  const config = configs[generator.id];

  const tile = generator.getTileSize(config);
  const metrics = useMemo(
    () => computeLayout(layout, tile.width, tile.height),
    [layout, tile.width, tile.height],
  );

  const setConfig = (next: unknown) =>
    setConfigs((prev) => ({ ...prev, [generator.id]: next }));

  const resetConfig = () => setConfig(generator.createDefault());

  // —— 适应宽度 ——
  const viewportRef = useRef<HTMLDivElement>(null);
  const fitToWidth = () => {
    const el = viewportRef.current;
    if (!el) return;
    const available = el.clientWidth - 48; // 留出内边距
    const pageWidthPx = metrics.pageWidth * MM_TO_PX;
    if (pageWidthPx > 0) setZoom(Math.max(0.1, Math.min(2, available / pageWidthPx)));
  };
  useLayoutEffect(() => {
    fitToWidth();
    // 仅在首次与纸张方向变化时自动适应
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics.pageWidth, metrics.pageHeight]);

  const cssPaper = layout.paper === 'Letter' ? 'letter' : layout.paper;

  const handleExportPng = async () => {
    setBusy(true);
    try {
      await exportPng(300, `markplot-${generator.id}.png`);
    } finally {
      setBusy(false);
    }
  };

  const Form = generator.Form;

  return (
    <div className="app">
      {/* 动态打印页面设置，保证物理尺寸与纸张方向正确 */}
      <style>{`@page { size: ${cssPaper} ${layout.orientation}; margin: 0; }`}</style>

      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo">⊹</span>
          <div>
            <h1>MarkPlot</h1>
            <p>可打印的坐标测量靶与自定义图样生成器</p>
          </div>
        </div>
        <div className="app__actions">
          <button className="btn btn--primary" onClick={printSheet}>
            打印
          </button>
          <button className="btn" onClick={() => exportSvg(`markplot-${generator.id}.svg`)}>
            导出 SVG
          </button>
          <button className="btn" onClick={handleExportPng} disabled={busy}>
            {busy ? '导出中…' : '导出 PNG'}
          </button>
        </div>
      </header>

      <div className="app__body">
        <aside className="sidebar">
          <SelectField
            label="图样类型"
            value={generator.id}
            options={GENERATORS.map((g) => ({ value: g.id, label: g.name }))}
            onChange={setGeneratorId}
          />
          <p className="sidebar__desc">{generator.description}</p>

          <div className="sidebar__scroll">
            <Form config={config} onChange={setConfig} />
            <LayoutForm layout={layout} onChange={setLayout} />
          </div>

          <button className="btn btn--ghost sidebar__reset" onClick={resetConfig}>
            重置当前图样参数
          </button>
        </aside>

        <main className="preview" ref={viewportRef}>
          <div className="preview__toolbar">
            <div className="preview__info">
              <span>
                单个 {tile.width}×{tile.height} mm
              </span>
              <span className="dot">·</span>
              <span>
                排布 {metrics.cols}×{metrics.rows}
              </span>
              <span className="dot">·</span>
              <span>本页 {metrics.count} 个</span>
            </div>
            <div className="zoom">
              <button className="btn btn--icon" onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}>
                −
              </button>
              <span className="zoom__value">{Math.round(zoom * 100)}%</span>
              <button className="btn btn--icon" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
                +
              </button>
              <button className="btn btn--ghost" onClick={fitToWidth}>
                适应宽度
              </button>
            </div>
          </div>

          <div className="preview__stage">
            <div
              className="sheet-scale"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <div className="print-area">
                <SheetPreview
                  generator={generator}
                  config={config}
                  layout={layout}
                  metrics={metrics}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
