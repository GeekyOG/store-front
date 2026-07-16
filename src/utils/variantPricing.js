// A variant option (e.g. "256GB") can carry its own absolute price that
// overrides the product's regular_price/discount_price. Given the customer's
// current selection, find the highest price override among matching options
// (normally only one axis carries a price at all — storage, say, not color —
// but if more than one does, the higher one wins so we never undercharge).
// Returns null when no selected option has a price override, meaning the
// product's own price should be used.
export function resolveVariantPrice(product, selectedOptions = {}) {
  const variants = product?.StorefrontVariants ?? [];
  let override = null;
  for (const variant of variants) {
    const selectedValue = selectedOptions[variant.name];
    if (!selectedValue) continue;
    const opt = (variant.StorefrontVariantOptions ?? []).find((o) => o.value === selectedValue);
    if (opt && opt.price != null) {
      const price = Number(opt.price);
      if (!Number.isNaN(price) && (override == null || price > override)) override = price;
    }
  }
  return override;
}
