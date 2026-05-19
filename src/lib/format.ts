export type CurrencyOpts = { currency?: string };

export function formatMoney(amount: number, opts: CurrencyOpts = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: opts.currency ?? "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompact(amount: number, opts: CurrencyOpts = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: opts.currency ?? "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}
