import { CheckboxField, FieldGroup, NumberField, SelectField } from '../components/fields';
import { PAPER_SIZES, type LayoutConfig, type Orientation, type PaperName } from '../lib/paper';

export function LayoutForm({
  layout,
  onChange,
}: {
  layout: LayoutConfig;
  onChange: (next: LayoutConfig) => void;
}) {
  const set = <K extends keyof LayoutConfig>(key: K, value: LayoutConfig[K]) =>
    onChange({ ...layout, [key]: value });

  return (
    <FieldGroup title="纸张与排版">
      <SelectField<PaperName>
        label="纸张"
        value={layout.paper}
        options={(Object.keys(PAPER_SIZES) as PaperName[]).map((p) => ({ value: p, label: p }))}
        onChange={(v) => set('paper', v)}
      />
      <SelectField<Orientation>
        label="方向"
        value={layout.orientation}
        options={[
          { value: 'portrait', label: '纵向' },
          { value: 'landscape', label: '横向' },
        ]}
        onChange={(v) => set('orientation', v)}
      />
      <NumberField
        label="页边距"
        unit="mm"
        value={layout.margin}
        min={0}
        max={40}
        step={1}
        onChange={(v) => set('margin', v)}
      />
      <NumberField
        label="图块间距"
        unit="mm"
        value={layout.gap}
        min={0}
        max={40}
        step={1}
        onChange={(v) => set('gap', v)}
      />
      <NumberField
        label="数量"
        value={layout.count}
        min={0}
        max={200}
        step={1}
        onChange={(v) => set('count', Math.round(v))}
        hint="0 = 自动铺满整页"
      />
      <CheckboxField
        label="图块裁切边框"
        checked={layout.showTileBorder}
        onChange={(v) => set('showTileBorder', v)}
      />
      <CheckboxField
        label="页面裁切标记与信息"
        checked={layout.showPageMarks}
        onChange={(v) => set('showPageMarks', v)}
      />
    </FieldGroup>
  );
}
