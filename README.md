# MarkPlot · 打印图样生成器

可在浏览器中生成、并**按毫米精确打印**各种测量/标定图样的工具。当前内置「坐标测量靶」，
架构上为后续扩展（如工业二维码、棋盘格标定板等）预留了统一的接口。

纯前端渲染（React + SVG），无后端，可一键部署到 Vercel。

## ✨ 特性

- **坐标测量靶**：把图样打印到纸上，用十字激光照射，即可读出激光中心相对原点的
  - **X / Y 位移**（直角网格 + 刻度数值）
  - **径向距离**（同心圆）
  - **角度偏差**（放射状角度线 + 角度标注）
- **可配置精度**
  - 坐标系分辨率（最小网格间距，mm）
  - 角度分辨率（相邻角度线夹角，°）
  - 同心圆间距、主线间隔、各类标注开关与配色
- **A4 多图排版**
  - 设置单个图样的整体宽度，自动计算单张纸可排布的行列数
  - 支持 A4 / A5 / A3 / Letter、纵向/横向、页边距、图块间距、数量（0 = 自动铺满）
- **所见即所得**：屏幕预览、打印、导出共用同一张按 mm 定尺的 SVG
- **导出**：直接打印、导出矢量 **SVG**、导出 300DPI **PNG**

## 🚀 在线使用 / 部署到 Vercel

本项目为纯静态前端，部署到 [Vercel](https://vercel.com) 非常简单：

1. 将仓库导入 Vercel（New Project → Import Git Repository）。
2. Vercel 会自动识别为 Vite 项目（`vercel.json` 已配置 `framework: vite`）。
   - Build Command：`npm run build`
   - Output Directory：`dist`
3. 点击 Deploy 即可。

或使用 CLI：

```bash
npm i -g vercel
vercel        # 预览部署
vercel --prod # 生产部署
```

## 🛠 本地开发

```bash
npm install
npm run dev       # 启动开发服务器（默认 http://localhost:5173）
npm run build     # 类型检查 + 生产构建到 dist/
npm run preview   # 本地预览生产构建
npm run typecheck # 仅做类型检查
```

环境：Node ≥ 18。

## 📐 测量靶使用方法

1. 在左侧设置「整体宽度」「坐标系分辨率」「角度分辨率」等参数。
2. 设置纸张与排版，让一张 A4 排满所需数量。
3. 点击「打印」，**务必在打印对话框中把缩放设为 100%（实际尺寸）、关闭"适应页面"**，
   以保证物理尺寸准确。建议先打印一张用直尺校验网格间距。
4. 将打印件固定在被测平面上，使靶心对准理论原点。
5. 用十字激光照射：
   - 激光交点落在网格上的位置 → 读取 **X/Y 位移**（或用同心圆读 **径向距离**）。
   - 激光十字的两条线相对靶面坐标轴的倾斜 → 对照 **角度线/角度数值** 读取 **角度偏差**。

> 提示：导出 SVG 后用 Inkscape / Illustrator 打开，可获得与打印完全一致的矢量图，
> 适合做存档或交给专业打印。

## 🧩 架构与扩展性

核心是一个「生成器（Generator）」抽象，框架层（排版、打印、导出、表单宿主）完全不关心
具体图样长什么样，只通过统一接口交互：

```
src/
├── generators/
│   ├── types.ts          # Generator 接口（扩展点）
│   ├── registry.ts       # 生成器注册表
│   └── crosshair/        # 坐标测量靶（一个 Generator 的完整实现）
│       ├── types.ts      #   配置类型与默认值
│       ├── CrosshairTile.tsx  #   SVG 渲染
│       ├── CrosshairForm.tsx  #   参数表单
│       └── index.ts      #   组装并导出 Generator
├── layout/               # A4 排版引擎与预览/出图 SVG
├── export/               # 打印 / SVG / PNG 导出
├── components/fields.tsx # 通用表单控件
└── lib/paper.ts          # 纸张尺寸与排版计算（单位 mm）
```

`Generator` 接口：

```ts
interface Generator<TConfig> {
  id: string;
  name: string;
  description: string;
  createDefault: () => TConfig;
  getTileSize: (config: TConfig) => { width: number; height: number }; // mm
  Tile: ComponentType<{ config: TConfig }>;          // 渲染单个图块的 SVG（坐标单位 mm）
  Form: ComponentType<{ config: TConfig; onChange: (c: TConfig) => void }>;
}
```

### 新增一种图样（例如工业二维码）

1. 在 `src/generators/qrcode/` 下实现：
   - `types.ts`：配置类型 + 默认值；
   - `QrTile.tsx`：把配置渲染为一个 `width×height`（mm）盒子内的 SVG 内容；
   - `QrForm.tsx`：配置表单；
   - `index.ts`：组装为一个 `Generator<QrConfig>`。
2. 在 `src/generators/registry.ts` 的 `GENERATORS` 数组中加入它。

完成后，类型选择器、排版、打印、SVG/PNG 导出会自动支持这一新图样，无需改动其它代码。

约定：`Tile` 渲染的 SVG 元素位于 `(0,0)` 到 `(width,height)` 的坐标系中，单位为 mm；
外层由排版引擎用嵌套 `<svg>` 负责定位与裁剪。

## 📄 单位与打印精度

整个应用以 **mm 作为 SVG 用户单位**（1 用户单位 = 1mm），出图 SVG 设置了
`width="210mm"` 等物理尺寸，配合打印时 `@page { margin: 0 }` 与 100% 缩放，
即可保证打印件的物理尺寸精确。
