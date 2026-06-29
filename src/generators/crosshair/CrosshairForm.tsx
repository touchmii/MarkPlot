import type { GeneratorFormProps } from '../types';
import type { CrosshairConfig } from './types';
import {
  CheckboxField,
  ColorField,
  FieldGroup,
  NumberField,
  TextField,
} from '../../components/fields';

export function CrosshairForm({ config, onChange }: GeneratorFormProps<CrosshairConfig>) {
  // 局部更新工具：只改一个字段。
  const set = <K extends keyof CrosshairConfig>(key: K, value: CrosshairConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <>
      <FieldGroup title="尺寸">
        <NumberField
          label="整体宽度"
          unit="mm"
          value={config.size}
          min={10}
          max={280}
          step={1}
          onChange={(v) => set('size', v)}
          hint="正方形边长，决定单张纸能排几个"
        />
      </FieldGroup>

      <FieldGroup title="直角坐标（X/Y 位移）">
        <NumberField
          label="坐标系分辨率"
          unit="mm"
          value={config.gridResolution}
          min={0.25}
          max={20}
          step={0.25}
          onChange={(v) => set('gridResolution', v)}
          hint="最小网格间距"
        />
        <NumberField
          label="主线间隔"
          unit="格"
          value={config.majorEvery}
          min={1}
          max={50}
          step={1}
          onChange={(v) => set('majorEvery', Math.round(v))}
          hint="每隔几格画一条加粗主线"
        />
        <CheckboxField
          label="显示次网格"
          checked={config.showMinorGrid}
          onChange={(v) => set('showMinorGrid', v)}
        />
        <CheckboxField
          label="显示主网格"
          checked={config.showMajorGrid}
          onChange={(v) => set('showMajorGrid', v)}
        />
        <CheckboxField
          label="标注坐标刻度"
          checked={config.showAxisLabels}
          onChange={(v) => set('showAxisLabels', v)}
        />
      </FieldGroup>

      <FieldGroup title="角度 / 极坐标（角度偏差）">
        <NumberField
          label="角度分辨率"
          unit="°"
          value={config.angleResolution}
          min={1}
          max={90}
          step={1}
          onChange={(v) => set('angleResolution', v)}
          hint="相邻角度线夹角"
        />
        <CheckboxField
          label="显示角度线"
          checked={config.showRadialLines}
          onChange={(v) => set('showRadialLines', v)}
        />
        <CheckboxField
          label="标注角度数值"
          checked={config.showAngleLabels}
          onChange={(v) => set('showAngleLabels', v)}
        />
        <NumberField
          label="角度标注间隔"
          unit="°"
          value={config.angleLabelStep}
          min={5}
          max={180}
          step={5}
          onChange={(v) => set('angleLabelStep', v)}
          hint="每隔多少度标一次（建议为分辨率整数倍）"
        />
        <CheckboxField
          label="显示同心圆"
          checked={config.showCircles}
          onChange={(v) => set('showCircles', v)}
        />
        <NumberField
          label="同心圆间距"
          unit="mm"
          value={config.circleResolution}
          min={1}
          max={50}
          step={1}
          onChange={(v) => set('circleResolution', v)}
        />
      </FieldGroup>

      <FieldGroup title="中心与标注">
        <CheckboxField
          label="显示中心十字主轴"
          checked={config.showCrosshair}
          onChange={(v) => set('showCrosshair', v)}
        />
        <CheckboxField
          label="显示原点圆点"
          checked={config.showCenterDot}
          onChange={(v) => set('showCenterDot', v)}
        />
        <TextField
          label="底部编号 / 标题"
          value={config.title}
          placeholder="可留空"
          onChange={(v) => set('title', v)}
        />
      </FieldGroup>

      <FieldGroup title="配色">
        <div className="color-row">
          <ColorField
            label="次网格"
            value={config.colorMinor}
            onChange={(v) => set('colorMinor', v)}
          />
          <ColorField
            label="主线 / 文字"
            value={config.colorMain}
            onChange={(v) => set('colorMain', v)}
          />
          <ColorField
            label="圆 / 角度线"
            value={config.colorAccent}
            onChange={(v) => set('colorAccent', v)}
          />
        </div>
      </FieldGroup>
    </>
  );
}
