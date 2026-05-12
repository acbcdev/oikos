"use client";

import type { Control } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FormValues } from "./schema";

export function DateField({
  control,
  required = true,
}: {
  control: Control<FormValues>;
  required?: boolean;
}) {
  return (
    <FormField
      control={control}
      name="date"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Date {required && "*"}</FormLabel>
          <FormControl>
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              maxDate={new Date()}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
