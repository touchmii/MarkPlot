import type { CrosshairConfig } from './types';

/** 数值格式化：去掉多余的小数位（如 5.00 → 5，2.50 → 2.5）。 */
function fmt(n: number): string {
  return parseFloat(n.toFixed(2)).toString();
}

// 各类线条的物理线宽（mm）。对 600dpi 激光打印机，0.08mm ≈ 2 个点。
const STROKE = {
  minor: 0.08,
  major: 0.18,
  axis: 0.3,
  circle: 0.16,
  radial: 0.1,
  cardinal: 0.22,
};

/**
 * 坐标测量靶图块。
 *
 * 坐标约定：盒子为 size×size（mm），原点在正中心；数学坐标系中
 * +X 向右、+Y 向上（SVG 中通过 y 取反实现）。
 */
export function CrosshairTile({ config }: { config: CrosshairConfig }) {
  const {
    size,
    gridResolution: g,
    majorEvery,
    showMinorGrid,
    showMajorGrid,
    showAxisLabels,
    showCircles,
    circleResolution,
    showRadialLines,
    angleResolution,
    showAngleLabels,
    angleLabelStep,
    showCrosshair,
    showCenterDot,
    title,
    colorMinor,
    colorMain,
    colorAccent,
  } = config;

  const c = size / 2; // 中心坐标

  // —— 1. 直角网格 —— 以中心为基准，向两侧按 g 间距生成网格线 ——
  const minorD: string[] = [];
  const majorD: string[] = [];
  if (g > 0 && (showMinorGrid || showMajorGrid)) {
    const maxK = Math.floor(c / g + 1e-6);
    for (let k = -maxK; k <= maxK; k++) {
      if (k === 0) continue; // 中心轴单独作为坐标轴绘制
      const isMajor = majorEvery > 0 && k % majorEvery === 0;
      if (isMajor && !showMajorGrid) continue;
      if (!isMajor && !showMinorGrid) continue;
      const offset = k * g;
      const sx = c + offset; // 垂直线（常数 x）
      const sy = c + offset; // 水平线（常数 y）
      const seg = `M${fmt(sx)} 0L${fmt(sx)} ${fmt(size)}M0 ${fmt(sy)}L${fmt(size)} ${fmt(sy)}`;
      (isMajor ? majorD : minorD).push(seg);
    }
  }

  // —— 2. 同心圆 —— 用于读取径向距离 ——
  const labelMargin = showAngleLabels ? 4.5 : 1;
  const maxR = Math.max(0, c - labelMargin);
  const ringCount =
    showCircles && circleResolution > 0 ? Math.floor(maxR / circleResolution + 1e-6) : 0;
  const rings: number[] = [];
  for (let n = 1; n <= ringCount; n++) rings.push(n * circleResolution);
  const outerR = ringCount > 0 ? ringCount * circleResolution : maxR;

  // —— 3. 放射状角度线 —— 用于读取角度偏差 ——
  const radialR = showRadialLines ? outerR : 0;
  const radialLines: { d: string; cardinal: boolean }[] = [];
  const angleLabels: { x: number; y: number; text: string }[] = [];
  if (showRadialLines && angleResolution > 0) {
    const steps = Math.round(360 / angleResolution);
    for (let i = 0; i < steps; i++) {
      const a = i * angleResolution;
      const rad = (a * Math.PI) / 180;
      const dx = Math.cos(rad);
      const dy = -Math.sin(rad); // SVG 中 y 向下，故取反使 +Y 朝上
      const cardinal = a % 90 === 0;
      radialLines.push({
        d: `M${fmt(c)} ${fmt(c)}L${fmt(c + dx * radialR)} ${fmt(c + dy * radialR)}`,
        cardinal,
      });
      if (showAngleLabels && angleLabelStep > 0 && a % angleLabelStep === 0) {
        const lr = radialR + 2.4;
        angleLabels.push({
          x: c + dx * lr,
          y: c + dy * lr,
          text: `${a}°`,
        });
      }
    }
  }

  // —— 4. 坐标轴刻度数值 ——
  type Anchor = 'start' | 'middle' | 'end';
  const axisLabels: { x: number; y: number; text: string; anchor: Anchor }[] = [];
  if (showAxisLabels && g > 0 && majorEvery > 0) {
    const maxK = Math.floor(c / g + 1e-6);
    // 跳过贴近边缘的刻度，避免文字被图块裁切。
    const limit = c - 3;
    // 根据物理间距自动抽稀：相邻标注至少间隔 minGap(mm)，避免数字重叠。
    const minGap = 5;
    const majorSpacing = g * majorEvery;
    const labelEveryMajors = Math.max(1, Math.ceil(minGap / majorSpacing - 1e-6));
    for (let k = -maxK; k <= maxK; k++) {
      if (k === 0 || k % majorEvery !== 0) continue;
      const majorIndex = k / majorEvery;
      if (majorIndex % labelEveryMajors !== 0) continue;
      const value = k * g;
      if (Math.abs(value) > limit) continue;
      // X 轴：标注在中心轴下方
      axisLabels.push({ x: c + value, y: c + 3, text: fmt(value), anchor: 'middle' });
      // Y 轴：标注在中心轴左侧（注意 +Y 朝上）
      axisLabels.push({ x: c - 1, y: c - value + 1, text: fmt(value), anchor: 'end' });
    }
  }

  return (
    <g>
      {/* 次网格 */}
      {minorD.length > 0 && (
        <path d={minorD.join('')} stroke={colorMinor} strokeWidth={STROKE.minor} fill="none" />
      )}
      {/* 主网格 */}
      {majorD.length > 0 && (
        <path d={majorD.join('')} stroke={colorMain} strokeWidth={STROKE.major} fill="none" />
      )}

      {/* 同心圆 */}
      {rings.map((r, i) => (
        <circle
          key={`ring-${i}`}
          cx={c}
          cy={c}
          r={r}
          stroke={colorAccent}
          strokeWidth={STROKE.circle}
          fill="none"
        />
      ))}

      {/* 角度线 */}
      {radialLines.map((l, i) => (
        <path
          key={`rad-${i}`}
          d={l.d}
          stroke={colorAccent}
          strokeWidth={l.cardinal ? STROKE.cardinal : STROKE.radial}
          fill="none"
        />
      ))}

      {/* 主坐标轴（中心十字） */}
      {showCrosshair && (
        <path
          d={`M${fmt(c)} 0L${fmt(c)} ${fmt(size)}M0 ${fmt(c)}L${fmt(size)} ${fmt(c)}`}
          stroke={colorMain}
          strokeWidth={STROKE.axis}
          fill="none"
        />
      )}

      {/* 原点圆点 */}
      {showCenterDot && <circle cx={c} cy={c} r={0.4} fill={colorMain} />}

      {/* 坐标轴刻度 */}
      {axisLabels.map((t, i) => (
        <text
          key={`ax-${i}`}
          x={t.x}
          y={t.y}
          fontSize={2}
          fill={colorMain}
          textAnchor={t.anchor}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {t.text}
        </text>
      ))}

      {/* 角度标注 */}
      {angleLabels.map((t, i) => (
        <text
          key={`an-${i}`}
          x={t.x}
          y={t.y}
          fontSize={2.2}
          fill={colorAccent}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {t.text}
        </text>
      ))}

      {/* 底部标题 / 编号 */}
      {title.trim() !== '' && (
        <text
          x={c}
          y={size - 1.5}
          fontSize={2.6}
          fill={colorMain}
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {title}
        </text>
      )}
    </g>
  );
}
