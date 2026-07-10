import { BASE_URL } from "../api/storefrontApi";

// Product/banner images are now served from dedicated binary endpoints
// (e.g. "/storefront/images/7") instead of being embedded as base64 in
// JSON responses — this just resolves that relative path against the API.
export function resolveImageUrl(path) {
  if (!path) return undefined;
  return `${BASE_URL}${path}`;
}

// The common "thumbnail" precedence used across product cards/lists: prefer
// the featured image if the product has one, else the first gallery image.
//
// Moving an item between cart and wishlist synthesizes a plain-object
// "product" with `featured_image` already set to a resolved URL (see
// Cart.jsx/Wishlist.jsx) — real API product objects never carry that field
// (the backend excludes the base64 column), so this passthrough is safe.
export function productThumb(product) {
  if (product?.featured_image) return product.featured_image;
  return resolveImageUrl(
    product?.has_featured_image ? product.featured_image_url : product?.StorefrontImages?.[0]?.url
  );
}
