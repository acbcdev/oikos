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
import type { Account } from "@/lib/data/wallet";
import { fmt } from "@/lib/utils/currency";
import type { FormValues } from "./schema";

export function AccountSelect({
  control,
  name,
  label,
  accounts,
}: {
  control: Control<FormValues>;
  name: "fromAccount" | "toAccount";
  label: string;
  accounts: Account[];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select
              value={field.value ?? ""}
              onValueChange={(v) => v && field.onChange(v)}
              disabled={accounts.length === 0}
            >
              <SelectTrigger>
                <span className="flex flex-1 text-left text-sm truncate">
                  {accounts.length === 0
                    ? "Add an account first"
                    : (accounts.find((a) => a.id === field.value)?.name ??
                      "Select account")}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <span className="flex flex-col">
                        <span>{acc.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {acc.type} ·{" "}
                          {fmt(acc.balance, acc.currency)}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
