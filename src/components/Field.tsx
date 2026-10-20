import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-lg border-2 border-line bg-paper px-3.5 py-2.5 text-ink placeholder:text-muted/70 transition-colors focus:border-ink focus:outline-none";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function Field({ label, hint, className = "", ...rest }: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">
        {label} {rest.required && <span className="text-accent">*</span>}
      </span>
      <input className={base} {...rest} />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

interface AreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextArea({ label, className = "", ...rest }: AreaProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">
        {label} {rest.required && <span className="text-accent">*</span>}
      </span>
      <textarea className={`${base} min-h-24 resize-y`} {...rest} />
    </label>
  );
}
