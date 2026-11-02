// Put this file at: client/src/lib/accountDetails.ts
export interface AccountDetails {
  bankName: string;
  branch: string;
  accountName: string;
  accountNumber: string;
}

export const emptyAccountDetails: AccountDetails = {
  bankName: "",
  branch: "",
  accountName: "",
  accountNumber: "",
};

/** Returns an error message, or null when the details are valid. Branch is optional. */
export const validateAccountDetails = (d: AccountDetails): string | null => {
  if (!d.bankName.trim()) return "Enter the bank name.";
  if (!d.accountName.trim()) return "Enter the account holder name.";
  if (!/^[0-9][0-9 -]{4,29}$/.test(d.accountNumber.trim()))
    return "Enter a valid account number (digits only, 5 to 30 characters).";
  return null;
};

/** Turns the fields into the text the server stores and the sponsor sees. */
export const formatAccountDetails = (d: AccountDetails): string =>
  [
    `Bank: ${d.bankName.trim()}`,
    d.branch.trim() ? `Branch: ${d.branch.trim()}` : null,
    `Account name: ${d.accountName.trim()}`,
    `Account number: ${d.accountNumber.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");