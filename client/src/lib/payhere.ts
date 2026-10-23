export const PAYHERE_SANDBOX = import.meta.env.VITE_PAYHERE_SANDBOX !== "false"; // default true
const PAYHERE_SDK_URL = "https://www.payhere.lk/lib/payhere.js";
export const PAYHERE_SDK_ERROR =
  "Could not load the PayHere payment library. Turn off your VPN, ad blocker or tracking protection for this site, then try again.";

export const ensurePayhere = async (): Promise<void> => {
  if (window.payhere) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PAYHERE_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(PAYHERE_SDK_ERROR));
    document.head.appendChild(script);
  });
  if (!window.payhere) throw new Error(PAYHERE_SDK_ERROR);
};