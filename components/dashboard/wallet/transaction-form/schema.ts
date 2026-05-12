import { z } from "zod";
import type { Transaction, TransactionType } from "@/lib/data/wallet";

export type { TransactionType };

export const typeOptions: { value: TransactionType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
];

export const todayISO = () => new Date().toLocaleDateString("en-CA");

export const transactionSchema = z
  .object({
    type: z.enum(["expense", "income", "transfer"]),
    amount: z.string().min(1, "Amount is required"),
    date: z.string().min(1, "Select a date"),
    fromAccount: z.string().min(1, "Select an account"),
    toAccount: z.string().optional(),
    categoryId: z.string().min(1, "Select a category"),
    description: z.string().max(200, "Max 200 characters").optional(),
  })
  .refine(
    (data) =>
      data.type !== "transfer" ||
      (data.toAccount && data.toAccount !== data.fromAccount),
    { message: "Transfer accounts must be different", path: ["toAccount"] },
  );

export type FormValues = z.infer<typeof transactionSchema>;

// Fallback for legacy localStorage data that predates the explicit `type` field
export const inferType = (tx: Transaction): TransactionType => {
  const t = (tx as { type?: TransactionType }).type;
  if (t) return t;
  if (tx.categoryId === "transfer") return "transfer";
  return tx.amount > 0 ? "income" : "expense";
};
