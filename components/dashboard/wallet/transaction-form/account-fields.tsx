"use client";

import type { Control } from "react-hook-form";
import type { Account } from "@/lib/data/wallet";
import { AccountSelect } from "./account-select";
import type { FormValues, TransactionType } from "./schema";

export function AccountFields({
  control,
  accounts,
  type,
}: {
  control: Control<FormValues>;
  accounts: Account[];
  type: TransactionType;
}) {
  return (
    <fieldset className="grid grid-cols-1 gap-4">
      <legend className="sr-only">Account</legend>
      {type === "transfer" ? (
        <div className="grid grid-cols-2 gap-4">
          <AccountSelect
            control={control}
            name="fromAccount"
            label="From Account *"
            accounts={accounts}
          />
          <AccountSelect
            control={control}
            name="toAccount"
            label="To Account *"
            accounts={accounts}
          />
        </div>
      ) : (
        <AccountSelect
          control={control}
          name="fromAccount"
          label="Account *"
          accounts={accounts}
        />
      )}
    </fieldset>
  );
}
