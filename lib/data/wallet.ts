export type TransactionType = "expense" | "income" | "transfer";

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: "checking" | "savings" | "investment";
  currency: string;
  balance: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  accountId: string;
  toAccountId?: string;
  description: string;
  categoryId: string;
  amount: number;
  date: string;
}

export interface TransactionGroup {
  label: string;
  transactions: Transaction[];
}
