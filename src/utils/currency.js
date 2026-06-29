const CURRENCY_MAP = {
  NGN: { symbol: '₦', code: 'NGN', label: 'Naira', locale: 'en-NG' },
  GHS: { symbol: 'GH₵', code: 'GHS', label: 'Cedis', locale: 'en-GH' },
  USD: { symbol: '$', code: 'USD', label: 'Dollars', locale: 'en-US' },
};

// Exchange rates relative to NGN (base currency)
// These are fallback defaults; the backend should be queried for live rates
const EXCHANGE_RATES = {
  NGN: 1,
  GHS: 14.2,  // 1 GHS ≈ 14.2 NGN (approximate, updated Jun 2026)
  USD: 1550,  // 1 USD ≈ 1550 NGN (approximate, updated Jun 2026)
};

export function getCurrency(currencyCode) {
  return CURRENCY_MAP[currencyCode] || CURRENCY_MAP.USD;
}

export function getUserCurrency(user) {
  const code = user?.currency || 'NGN';
  return getCurrency(code);
}

export function getWalletCurrency(wallet, user) {
  const code = wallet?.currency || user?.currency || 'NGN';
  return getCurrency(code);
}

export function convertAmount(amount, fromCurrency, toCurrency) {
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  const amountInNGN = parseFloat(amount || 0) * fromRate;
  return amountInNGN / toRate;
}

export function formatCurrency(amount, user, displayCurrency) {
  const cur = displayCurrency ? getCurrency(displayCurrency) : getUserCurrency(user);
  const num = parseFloat(amount || 0);
  return `${cur.symbol}${num.toLocaleString()}`;
}

export function formatConvertedCurrency(amount, fromCurrency, toCurrency) {
  const converted = convertAmount(amount, fromCurrency, toCurrency);
  const cur = getCurrency(toCurrency);
  return `${cur.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
