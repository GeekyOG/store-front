// Serialized products tag each physical unit (StorefrontSerialNumber) with
// the variant combination it is, e.g. { Color: "Black", Storage: "128GB" }.
// As the customer picks options one axis at a time, only require the axes
// they've picked so far to match — this lets the displayed stock count
// narrow live as each choice is made instead of jumping only once every
// axis is selected. Mirrors the exact-match rules used server-side in
// aoudit-be/src/utils/variantOptions.js once the whole combo is chosen.
function parseSelectedOptions(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw) ?? {};
  } catch {
    return {};
  }
}

function serialMatchesSelection(serialOptions, selectedOptions) {
  const serial = parseSelectedOptions(serialOptions);
  return Object.entries(selectedOptions).every(
    ([key, value]) => !value || serial[key] === value,
  );
}

// Non-serialized products have no per-variant stock field, so their count
// stays product-level (online_quantity) regardless of selection.
export function getVariantStockCount(product, selectedOptions = {}) {
  if (!product?.is_serialized) return product?.online_quantity ?? 0;
  const serials = product.StorefrontSerialNumbers ?? [];
  return serials.filter((s) => serialMatchesSelection(s.selected_options, selectedOptions)).length;
}
