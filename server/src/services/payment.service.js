const crypto = require("crypto");

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

// Generates the hash PayHere requires when the customer is redirected to checkout
function generateCheckoutHash(orderId, amount, currency = "LKR") {
  const amountFormatted = Number(amount)
    .toLocaleString("en-us", {
      minimumFractionDigits: 2,
    })
    .replaceAll(",", "");

  const secretHash = crypto
    .createHash("md5")
    .update(MERCHANT_SECRET)
    .digest("hex")
    .toUpperCase();

  const hash = crypto
    .createHash("md5")
    .update(MERCHANT_ID + orderId + amountFormatted + currency + secretHash)
    .digest("hex")
    .toUpperCase();

  return hash;
}

// Verifies the md5sig PayHere sends back on the notify webhook
function verifyNotifySignature({
  merchant_id,
  order_id,
  payhere_amount,
  payhere_currency,
  status_code,
  md5sig,
}) {
  const secretHash = crypto
    .createHash("md5")
    .update(MERCHANT_SECRET)
    .digest("hex")
    .toUpperCase();

  const localSig = crypto
    .createHash("md5")
    .update(
      merchant_id +
        order_id +
        payhere_amount +
        payhere_currency +
        status_code +
        secretHash
    )
    .digest("hex")
    .toUpperCase();

  return localSig === md5sig;
}

module.exports = { generateCheckoutHash, verifyNotifySignature };
