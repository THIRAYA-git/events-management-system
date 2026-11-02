// Put this file at: client/src/components/customer/AccountDetailsFields.tsx
import type { AccountDetails } from "@/lib/accountDetails";

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500";

interface Props {
  value: AccountDetails;
  onChange: (v: AccountDetails) => void;
}

export function AccountDetailsFields({ value, onChange }: Props) {
  const set =
    (key: keyof AccountDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [key]: e.target.value });

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium">Bank name</label>
        <input
          className={inputCls}
          value={value.bankName}
          onChange={set("bankName")}
          maxLength={100}
          placeholder="e.g. Bank of Ceylon"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">
          Branch <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          className={inputCls}
          value={value.branch}
          onChange={set("branch")}
          maxLength={100}
          placeholder="e.g. Kalmunai"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">
          Account holder name
        </label>
        <input
          className={inputCls}
          value={value.accountName}
          onChange={set("accountName")}
          maxLength={100}
          placeholder="Name on the account"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">Account number</label>
        <input
          className={inputCls}
          value={value.accountNumber}
          onChange={set("accountNumber")}
          maxLength={30}
          inputMode="numeric"
          placeholder="Digits only"
        />
      </div>
    </div>
  );
}
