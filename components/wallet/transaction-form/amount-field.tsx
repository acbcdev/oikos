"use client";

import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatInteger, stripNumberFormat } from "@/lib/utils/number-format";
import type { FormValues } from "./schema";

export function AmountField({
  control,
  currencySymbol,
}: {
  control: Control<FormValues>;
  currencySymbol: string;
}) {
  return (
    <FormField
      control={control}
      name="amount"
      render={({ field }) => (
        <FormItem className="space-y-1 text-center py-2 ">
          <FormLabel className="mx-auto">Transaction Amount *</FormLabel>
          <FormControl>
            <div className="flex items-center justify-center gap-2 bg-secondary/60 rounded-xl px-2 mt-2 py-1">
              <span className="text-4xl font-bold text-primary font-display">
                {currencySymbol}
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                // biome-ignore lint/a11y/noAutofocus: <valid use-case>
                autoFocus
                value={formatInteger(field.value)}
                onChange={(e) =>
                  field.onChange(e.target.value.replace(/\D/g, ""))
                }
                onPaste={(e) => {
                  e.preventDefault();
                  const digits = stripNumberFormat(
                    e.clipboardData.getData("text"),
                  ).replace(/[.-]/g, "");
                  field.onChange(digits);
                }}
                className=" text-center text-6xl font-bold text-primary font-display placeholder:text-primary/20 outline-none w-full"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
