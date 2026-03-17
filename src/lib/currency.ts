/**
 * Currency Utility for LuxeLedger
 * Current manual rate: 1 USD = 300 LKR (Adjustable)
 */

export const USD_TO_LKR_RATE = 300;

export const formatUSD = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatLKR = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const convertToLKR = (usdAmount: number) => {
  return usdAmount * USD_TO_LKR_RATE;
};

/**
 * Returns a dual currency string if needed
 */
export const formatDualCurrency = (amount: number) => {
  return formatLKR(amount);
};
