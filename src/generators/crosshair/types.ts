/**
 * 坐标测量靶配置。
 *
 * 用途：把该图样打印到纸上，用十字激光照射时，可读出激光中心相对原点的
 * X/Y 位移、径向距离，以及十字激光相对靶面坐标轴的角度偏差。
 */
export interface CrosshairConfig {
  /** 整体宽度（正方形边长），mm。用于在 A4 上排布多个。 */
  size: number;

  // —— 直角坐标网格（读取 X/Y 位移）——
  /** 坐标系分辨率：最小网格间距，mm */
  gridResolution: number;
  /** 每隔多少格画一条加粗的主网格线 */
  majorEvery: number;
  /** 显示次网格 */
  showMinorGrid: boolean;
  /** 显示主网格 */
  showMajorGrid: boolean;
  /** 在坐标轴上标注刻度数值（mm） */
  showAxisLabels: boolean;

  // —— 极坐标 / 角度（读取角度偏差与径向距离）——
  /** 显示同心圆 */
  showCircles: boolean;
  /** 同心圆半径间距，mm */
  circleResolution: number;
  /** 显示放射状角度线 */
  showRadialLines: boolean;
  /** 角度分辨率：相邻角度线的夹角，度 */
  angleResolution: number;
  /** 显示角度数值标注 */
  showAngleLabels: boolean;
  /** 每隔多少度标注一次角度（应为角度分辨率的整数倍） */
  angleLabelStep: number;

  // —— 中心与外观 ——
  /** 显示中心十字主轴 */
  showCrosshair: boolean;
  /** 显示中心原点圆点 */
  showCenterDot: boolean;
  /** 图块底部标题 / 编号（留空则不显示） */
  title: string;

  // —— 配色（便于激光照射时对比）——
  /** 次网格颜色 */
  colorMinor: string;
  /** 主网格 / 坐标轴 / 文字颜色 */
  colorMain: string;
  /** 强调色：同心圆与角度线 */
  colorAccent: string;
}

export const DEFAULT_CROSSHAIR: CrosshairConfig = {
  size: 60,

  gridResolution: 1,
  majorEvery: 5,
  showMinorGrid: true,
  showMajorGrid: true,
  showAxisLabels: true,

  showCircles: true,
  circleResolution: 5,
  showRadialLines: true,
  angleResolution: 15,
  showAngleLabels: true,
  angleLabelStep: 30,

  showCrosshair: true,
  showCenterDot: true,
  title: '',

  colorMinor: '#c8c8c8',
  colorMain: '#111111',
  colorAccent: '#1565c0',
};
