import type { Generator } from '../types';
import { CrosshairForm } from './CrosshairForm';
import { CrosshairTile } from './CrosshairTile';
import { DEFAULT_CROSSHAIR, type CrosshairConfig } from './types';

/** 坐标测量靶生成器。 */
export const crosshairGenerator: Generator<CrosshairConfig> = {
  id: 'crosshair',
  name: '坐标测量靶',
  description: '十字激光照射读取 X/Y 位移与角度偏差',
  createDefault: () => ({ ...DEFAULT_CROSSHAIR }),
  getTileSize: (config) => ({ width: config.size, height: config.size }),
  Tile: CrosshairTile,
  Form: CrosshairForm,
};

export type { CrosshairConfig };
