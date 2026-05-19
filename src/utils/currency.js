const CURRENCY_MAP = {
  NGN: { symbol: '₦', code: 'NGN', label: 'Naira', locale: 'en-NG' },
  GHS: { symbol: 'GH₵', code: 'GHS', label: 'Cedis', locale: 'en-GH' },
  USD: { symbol: '$', code: 'USD', label: 'Dollars', locale: 'en-US' },
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

export function formatCurrency(amount, user) {
  const { symbol } = getUserCurrency(user);
  const num = parseFloat(amount || 0);
  return `${symbol}${num.toLocaleString()}`;
}
