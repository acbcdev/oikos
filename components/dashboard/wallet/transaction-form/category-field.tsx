"use client";

import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/data/categories";
import type { FormValues } from "./schema";

export function CategoryField({ control }: { control: Control<FormValues> }) {
  return (
    <FormField
      control={control}
      name="categoryId"
      render={({ field }) => {
        const selected = CATEGORIES.find((c) => c.id === field.value);
        const SelectedIcon = selected?.icon;
        return (
          <FormItem>
            <FormLabel>Category *</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(v) => v && field.onChange(v)}
              >
                <SelectTrigger>
                  {selected && SelectedIcon ? (
                    <span className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span
                        className="size-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${selected.color}20` }}
                      >
                        <SelectedIcon
                          size={13}
                          style={{ color: selected.color }}
                        />
                      </span>
                      <span className="text-sm truncate">{selected.name}</span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Select category
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectGroup>
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-3">
                            <span
                              className="size-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${cat.color}20` }}
                            >
                              <Icon size={15} style={{ color: cat.color }} />
                            </span>
                            <span className="flex flex-col">
                              <span className="text-sm font-semibold">
                                {cat.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {cat.desc}
                              </span>
                            </span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
