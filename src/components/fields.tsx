import type { ReactNode } from 'react';

/** 一组可复用的小型表单控件，统一样式与布局。 */

export function NumberField(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
}) {
  const { label, value, onChange, min, max, step, unit, hint } = props;
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {unit && <span className="field__unit">{unit}</span>}
      </span>
      <input
        className="field__input"
        type="number"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        max={max}
        step={step ?? 'any'}
        onChange={(e) => {
          const v = e.target.valueAsNumber;
          if (Number.isNaN(v)) return;
          let next = v;
          if (min !== undefined) next = Math.max(min, next);
          if (max !== undefined) next = Math.min(max, next);
          onChange(next);
        }}
      />
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

export function TextField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const { label, value, onChange, placeholder, hint } = props;
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        className="field__input"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

export function SelectField<T extends string>(props: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const { label, value, options, onChange } = props;
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select
        className="field__input"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField(props: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { label, checked, onChange } = props;
  return (
    <label className="checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function ColorField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { label, value, onChange } = props;
  return (
    <label className="color-field">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <span>{label}</span>
    </label>
  );
}

export function FieldGroup(props: { title: string; children: ReactNode }) {
  return (
    <fieldset className="field-group">
      <legend>{props.title}</legend>
      {props.children}
    </fieldset>
  );
}
