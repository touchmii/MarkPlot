import type { AnyGenerator } from './types';
import { crosshairGenerator } from './crosshair';

/**
 * 生成器注册表。
 *
 * 新增一种打印图样（如工业二维码）时：
 *   1. 在 generators/<name>/ 下实现一个 Generator；
 *   2. 在此处的 GENERATORS 数组中加入它。
 * 其余 UI、排版、打印、导出逻辑都会自动支持新类型。
 */
export const GENERATORS: AnyGenerator[] = [crosshairGenerator];

export function getGenerator(id: string): AnyGenerator | undefined {
  return GENERATORS.find((g) => g.id === id);
}

export const DEFAULT_GENERATOR_ID = GENERATORS[0]?.id ?? '';
