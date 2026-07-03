import type { Control } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, type FormValues } from "./schema";

interface DetailsFieldsProps {
  control: Control<FormValues>;
  watchedType: FormValues["type"];
}

export function DetailsFields({ control, watchedType }: DetailsFieldsProps) {
  return (
    <>
      {/* Quantity + Buy Price + Currency */}
      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={control}
          name="buyPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                {watchedType === "real-estate" ? "Purchase Value" : "Buy Price"}
              </FormLabel>
              <FormControl>
                <NumberInput
                  {...field}
                  size="lg"
                  min={0}
                  placeholder="150.00"
                  onValueChange={(v) => field.onChange(v)}
                />
              </FormControl>
              <FormMessage className="text-xs text-negative" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                {watchedType === "real-estate" ? "Units" : "Quantity"}
              </FormLabel>
              <FormControl>
                <NumberInput
                  {...field}
                  size="lg"
                  min={0}
                  placeholder="10"
                  onValueChange={(v) => field.onChange(v)}
                />
              </FormControl>
              <FormMessage className="text-xs text-negative" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                Currency
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger size="lg" className="w-full">
                    <SelectValue placeholder="USD" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c} className="font-body">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      {/* Purchase date */}
      <FormField
        control={control}
        name="purchaseDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
              Purchase Date
            </FormLabel>
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              placeholder="Pick a date"
            />
            <FormMessage className="text-xs text-negative" />
          </FormItem>
        )}
      />

      {/* Notes */}
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
              Notes{" "}
              <span className="font-normal tracking-normal normal-case text-muted-foreground/50">
                (optional)
              </span>
            </FormLabel>
            <FormControl>
              <textarea
                {...field}
                rows={2}
                placeholder="Any notes about this position..."
                className="w-full px-4 py-3 text-sm outline-none resize-none bg-secondary/60 rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
              />
            </FormControl>
            <FormMessage className="text-xs text-negative" />
          </FormItem>
        )}
      />
    </>
  );
}
