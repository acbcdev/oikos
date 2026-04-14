"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderPlus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInvestmentStore } from "@/lib/store/investment-store";
import type { Portfolio } from "@/lib/data/portfolio";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Max 50 characters"),
  description: z.string().max(200, "Max 200 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreatePortfolioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio?: Portfolio;
}

export function CreatePortfolioModal({
  open,
  onOpenChange,
  portfolio,
}: CreatePortfolioModalProps) {
  const addPortfolio = useInvestmentStore((s) => s.addPortfolio);
  const updatePortfolio = useInvestmentStore((s) => s.updatePortfolio);
  const isEditing = !!portfolio;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: portfolio?.name ?? "",
        description: portfolio?.description ?? "",
      });
    }
  }, [open, portfolio, form]);

  function onSubmit(values: FormValues) {
    if (isEditing) {
      updatePortfolio(portfolio.id, {
        name: values.name,
        description: values.description || undefined,
      });
    } else {
      addPortfolio({
        id: crypto.randomUUID(),
        name: values.name,
        description: values.description || undefined,
        createdAt: new Date().toISOString(),
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-white/5 p-0 gap-0">
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/5">
          <span className="size-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            {isEditing ? (
              <Pencil size={16} className="text-primary" />
            ) : (
              <FolderPlus size={16} className="text-primary" />
            )}
          </span>
          <DialogTitle className="font-display font-bold text-lg text-foreground">
            {isEditing ? "Edit Portfolio" : "Create Portfolio"}
          </DialogTitle>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      size="lg"
                      placeholder="Crypto Portfolio"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-negative" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground">
                    Description{" "}
                    <span className="text-muted-foreground/50 normal-case tracking-normal font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      size="lg"
                      rows={2}
                      placeholder="Long-term crypto holdings"
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-negative" />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {isEditing ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
