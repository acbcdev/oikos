"use client";

import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { FormValues } from "./schema";

export function DescriptionField({ control }: { control: Control<FormValues> }) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Add a short note..."
              value={field.value ?? ""}
              onChange={field.onChange}
              rows={4}
              className="w-full bg-secondary/60 border-none rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/30 resize-none text-sm font-body min-h-20"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
