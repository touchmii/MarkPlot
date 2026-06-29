import type { ComponentType } from 'react';

/**
 * 「生成器」是 MarkPlot 的核心扩展点。
 *
 * 每一种可打印图样（坐标测量靶、工业二维码、标定板……）实现一个 Generator：
 *  - 描述自己的配置类型 TConfig；
 *  - 给出默认配置；
 *  - 根据配置算出图块的物理尺寸（mm）；
 *  - 提供一个把配置渲染为 SVG 内容的组件 `Tile`；
 *  - 提供一个编辑配置的表单组件 `Form`。
 *
 * 主框架（排版引擎、打印、导出）完全不关心具体图样，只通过该接口交互。
 * 新增一种图样 = 新增一个 Generator 并在 registry 注册，无需改动其他代码。
 */
export interface Generator<TConfig = unknown> {
  /** 唯一标识，例如 "crosshair"、"qrcode" */
  id: string;
  /** 显示名称 */
  name: string;
  /** 一句话说明 */
  description: string;

  /** 创建一份默认配置 */
  createDefault: () => TConfig;

  /**
   * 根据配置返回图块的物理尺寸（mm）。
   * 排版引擎据此在 A4 上计算行列与位置。
   */
  getTileSize: (config: TConfig) => { width: number; height: number };

  /**
   * 渲染单个图块的 SVG 内容。
   *
   * 约定：组件返回的 SVG 元素位于一个 (0,0) 到 (width,height) 的坐标系中，
   * 单位为 mm。外层由排版引擎用嵌套 `<svg>` 负责定位与裁剪，
   * 因此这里只需关注「在一个 width×height 的盒子里画什么」。
   */
  Tile: ComponentType<{ config: TConfig }>;

  /** 配置编辑表单 */
  Form: ComponentType<GeneratorFormProps<TConfig>>;
}

export interface GeneratorFormProps<TConfig> {
  config: TConfig;
  onChange: (next: TConfig) => void;
}

/** 一个带具体配置值的生成器实例（用于序列化 / 持久化）。 */
export interface GeneratorInstance<TConfig = unknown> {
  generatorId: string;
  config: TConfig;
}

/**
 * 注册表 / 框架层使用的「任意配置」生成器类型。
 *
 * 这里有意使用 any：框架层（注册表、排版、打印）需要把不同 TConfig 的生成器
 * 放进同一个集合中统一处理，而 React 组件参数是逆变的，用 unknown 会触发协变报错。
 * any 被限制在框架边界，具体生成器内部仍是强类型。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyGenerator = Generator<any>;
