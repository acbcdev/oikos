"use client";

import type { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem } from "@/components/ui/form";
import { type FormValues, typeOptions } from "./schema";

export function TypeToggle({ control }: { control: Control<FormValues> }) {
  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <fieldset
            className="grid p-2 bg-white/5 rounded-lg"
            style={{
              gridTemplateColumns: `repeat(${typeOptions.length}, 1fr)`,
            }}
          >
            <legend className="sr-only">Transaction type</legend>
            {typeOptions.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={field.value === opt.value ? "default" : "ghost"}
                onClick={() => field.onChange(opt.value)}
                className={`py-2.5 h-auto text-sm font-bold font-display rounded-md border-0 ${
                  field.value === opt.value
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
              >
                {opt.label}
              </Button>
            ))}
          </fieldset>
        </FormItem>
      )}
    />
  );
}
