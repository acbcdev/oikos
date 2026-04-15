"use client";

import { useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { formatLive, stripNumberFormat } from "@/lib/utils/number-format";

const numberInputVariants = cva(
  "inline-flex w-full min-w-0 overflow-hidden border border-transparent bg-secondary/60 text-base transition-colors focus-within:ring-2 focus-within:ring-primary/50",
  {
    variants: {
      size: {
        default: "h-8 rounded-lg",
        lg: "h-11 rounded-xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const numberInputFieldVariants = cva(
  "flex-1 bg-transparent outline-none text-foreground tabular-nums placeholder:text-muted-foreground md:text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  {
    variants: {
      size: {
        default: "h-8 py-1",
        lg: "h-11 py-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface NumberInputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof numberInputVariants> {
  prefix?: string;
  onValueChange?: (value: string) => void;
  format?: boolean;
}

export function NumberInput({
  prefix,
  onValueChange,
  className,
  size,
  step = 1,
  min,
  max,
  value,
  onChange,
  disabled,
  format = true,
  ...props
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function clamp(n: number) {
    const lo = min !== undefined ? Number(min) : -Infinity;
    const hi = max !== undefined ? Number(max) : Infinity;
    return Math.min(Math.max(n, lo), hi);
  }

  function nudge(dir: 1 | -1) {
    const current = parseFloat(String(value ?? "0")) || 0;
    const next = String(
      clamp(parseFloat((current + dir * Number(step)).toFixed(10))),
    );
    onValueChange?.(next);
    const nativeInput = inputRef.current;
    if (nativeInput) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(nativeInput, next);
      nativeInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    nativeInput?.focus();
  }

  const numValue = parseFloat(String(value ?? ""));
  const atMax =
    max !== undefined && !isNaN(numValue) && numValue >= Number(max);
  const atMin =
    min !== undefined && !isNaN(numValue) && numValue <= Number(min);

  const paddingX = size === "lg" ? "px-4" : "px-2.5";

  return (
    <div
      className={cn(
        numberInputVariants({ size }),
        disabled &&
          "pointer-events-none cursor-not-allowed opacity-50 bg-input/50",
        className,
      )}
    >
      {prefix && (
        <span
          className={cn(
            "shrink-0 select-none text-sm text-muted-foreground flex items-center",
            size === "lg" ? "pl-4" : "pl-2.5",
          )}
        >
          {prefix}
        </span>
      )}

      <input
        {...props}
        ref={inputRef}
        type={format ? "text" : "number"}
        inputMode={format ? "decimal" : undefined}
        step={format ? undefined : step}
        min={format ? undefined : min}
        max={format ? undefined : max}
        value={format ? formatLive((value as string) ?? "") : value}
        onChange={
          format
            ? (e) => {
                const raw = stripNumberFormat(e.target.value);
                onValueChange?.(raw);
              }
            : onChange
        }
        disabled={disabled}
        className={cn(
          numberInputFieldVariants({ size }),
          prefix ? "px-1.5" : paddingX,
        )}
      />

      <div className="flex h-full flex-col border-l border-input shrink-0">
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || atMax}
          onClick={() => nudge(1)}
          className="flex flex-1 w-6 items-center justify-center text-muted-foreground/80 transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronUp size={12} aria-hidden />
        </button>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || atMin}
          onClick={() => nudge(-1)}
          className="flex flex-1 w-6 items-center justify-center border-t border-input text-muted-foreground/80 transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronDown size={12} aria-hidden />
        </button>
      </div>
    </div>
  );
}
