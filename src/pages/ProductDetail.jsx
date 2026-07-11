import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Package,
  Heart,
  ShoppingCart,
  Check,
  Minus,
  Plus,
  ChevronRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useGetPublicProductQuery, useAddReviewMutation, useGetMyOrdersQuery } from "../api/storefrontApi";
import { addToCart, selectCartItems } from "../store/cartSlice";
import { toggleWishlist, selectIsWishlisted } from "../store/wishlistSlice";
import { selectCurrentCustomer } from "../store/authSlice";
import { resolveImageUrl } from "../utils/imageUrl";
import ProductTabs from "../components/ProductTabs";

function StarRating({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < value ? "text-amber-400 fill-amber-400" : "text-neutral-200 fill-neutral-200"}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: product, isLoading } = useGetPublicProductQuery(id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const cartItems = useSelector(selectCartItems);
  const wishlisted = useSelector(selectIsWishlisted(Number(id)));
  const customer = useSelector(selectCurrentCustomer);
  const { data: myOrdersData } = useGetMyOrdersQuery(undefined, { skip: !customer });
  const [addReview, { isLoading: submittingReview }] = useAddReviewMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 rounded-full border-2 border-neutral-200 border-t-primary-500 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <p className="text-neutral-500">Product not found</p>
        <Link
          to="/products"
          className="text-primary-500 hover:underline text-sm"
        >
          ← Back to products
        </Link>
      </div>
    );
  }

  const allImages = [
    ...(product.has_featured_image ? [{ url: product.featured_image_url }] : []),
    ...(product.StorefrontImages ?? []),
  ];
  const price = product.discount_price ?? product.regular_price;
  const hasDiscount = !!product.discount_price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.discount_price / product.regular_price) * 100)
    : 0;
  // API returns only available serials (where: { status: "available" }), so length == available stock.
  const stockCount = product.is_serialized
    ? (product.StorefrontSerialNumbers?.length ?? 0)
    : (product.online_quantity ?? 0);
  const inStock = stockCount > 0;
  const maxQty = Math.min(stockCount, 99);

  // Check if this exact variant combo is already in cart
  const optKey = JSON.stringify(selectedOptions);
  const inCart = cartItems.some(
    (i) => i.id === product.id && i.optKey === optKey,
  );

  const selectableVariants = (product.StorefrontVariants ?? []).filter(
    (v) => (v.StorefrontVariantOptions ?? []).length > 0,
  );
  const allVariantsSelected =
    selectableVariants.length === 0 ||
    selectableVariants.every((v) => selectedOptions[v.name]);

  const reviews = [...(product.Reviews ?? [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const myReview = customer ? reviews.find((r) => r.customerId === customer.id) : null;
  // Only customers with a delivered order containing this product may review it.
  const hasDeliveredThisProduct = (myOrdersData?.orders ?? []).some(
    (o) => o.status === "delivered" &&
      (o.StorefrontOrderItems ?? []).some((it) => it.storefrontProductId === product.id),
  );
  const canReview = !!customer && !myReview && hasDeliveredThisProduct;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    try {
      await addReview({ productId: product.id, rating: reviewRating, comment: reviewComment }).unwrap();
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      setReviewError(err?.data?.message ?? "Failed to submit review.");
    }
  };

  const handleAddToCart = () => {
    if (!inStock || !allVariantsSelected) return;
    dispatch(addToCart({ product, selectedOptions, quantity: qty }));
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    if (!inStock || !allVariantsSelected) return;
    dispatch(addToCart({ product, selectedOptions, quantity: qty }));
    navigate("/cart");
  };

  const handleWishlist = () => dispatch(toggleWishlist(product));

  const selectOption = (variantName, value) =>
    setSelectedOptions((prev) => ({ ...prev, [variantName]: value }));

  const variantSuffix = selectableVariants
    .map((v) => selectedOptions[v.name])
    .filter(Boolean)
    .map((value) => ` (${value})`)
    .join("");
  const whatsappMessage = `Hi, I'd like to order ${product.display_name}${variantSuffix}`;
  const whatsappHref = `https://wa.me/2347038784788?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div>
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-neutral-400 mb-6">
          <Link to="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={11} />
          <Link
            to="/products"
            className="hover:text-primary-600 transition-colors"
          >
            Products
          </Link>
          <ChevronRight size={11} />
          <span className="text-neutral-600 truncate max-w-[200px]">
            {product.display_name}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ── Images ────────────────────────────────��────────────────────── */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-neutral-200 relative">
              {allImages.length > 0 ? (
                <img
                  src={resolveImageUrl(allImages[selectedImage]?.url)}
                  alt={product.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-6xl">
                  <Package size={64} className="text-neutral-200" />
                </div>
              )}
              {hasDiscount && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  -{discountPct}%
                </span>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImage
                        ? "border-primary-500 shadow-sm"
                        : "border-neutral-200"
                    }`}
                  >
                    <img
                      src={resolveImageUrl(img.url)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ────────────────────────────────────────────────── */}
          <div className="space-y-5">
            {product.Category && (
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
                {product.Category.name}
                {product.Subcategory && ` · ${product.Subcategory.name}`}
              </p>
            )}

            <h1 className="text-2xl font-bold text-neutral-800 leading-snug">
              {product.display_name}
            </h1>

            {product.short_description && (
              <p className="text-neutral-500 text-sm leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary-600">
                ₦{price?.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-neutral-400 line-through">
                    ₦{product.regular_price?.toLocaleString()}
                  </span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                    {discountPct}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${inStock ? "text-emerald-600" : "text-red-500"}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-400"}`}
              />
              {inStock
                ? product.is_serialized
                  ? `${stockCount} unit${stockCount !== 1 ? "s" : ""} available`
                  : `${stockCount} in stock`
                : "Out of stock"}
            </div>

            {/* Variants */}
            {selectableVariants.map((variant) => (
              <div key={variant.id}>
                <p className="mb-2 text-sm font-semibold text-neutral-700">
                  {variant.name}
                  {selectedOptions[variant.name] && (
                    <span className="ml-2 font-normal text-neutral-400">
                      — {selectedOptions[variant.name]}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {variant.StorefrontVariantOptions.map((opt) => {
                    const isSelected =
                      selectedOptions[variant.name] === opt.value;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectOption(variant.name, opt.value)}
                        className={`rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        {opt.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity */}
            {inStock && (
              <div>
                <p className="mb-2 text-sm font-semibold text-neutral-700">
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-neutral-500 hover:bg-neutral-50 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-neutral-800 min-w-[3rem] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                      className="px-3 py-2 text-neutral-500 hover:bg-neutral-50 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-neutral-400">Max {maxQty}</span>
                </div>
              </div>
            )}

            {/* Variant warning */}
            {selectableVariants.length > 0 && !allVariantsSelected && (
                <p className="text-xs text-amber-600 font-medium">
                  Please select all options above before adding to cart.
                </p>
              )}

            {/* CTA buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || !allVariantsSelected}
                className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                  addedFeedback
                    ? "bg-emerald-500 text-white"
                    : "bg-primary-600 hover:bg-primary-700 text-white"
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check size={16} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />{" "}
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!inStock || !allVariantsSelected}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-primary-600 py-3 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>

              <button
                onClick={handleWishlist}
                className={`h-12 w-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  wishlisted
                    ? "bg-red-50 border-red-300 text-red-500"
                    : "border-neutral-200 text-neutral-400 hover:border-red-300 hover:text-red-400"
                }`}
                title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Order via WhatsApp */}
            {inStock && allVariantsSelected && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white transition-all [background:linear-gradient(135deg,rgb(40,138,1),rgb(11,66,0))] hover:opacity-90 shadow-sm"
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 448 512"
                  className="w-4 h-4 shrink-0"
                  aria-hidden="true"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
                Order via WhatsApp
              </a>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100">
              {[
                { icon: Truck, label: "Free delivery" },
                { icon: ShieldCheck, label: "Secure checkout" },
                { icon: RefreshCw, label: "Easy returns" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-neutral-50 text-center"
                >
                  <Icon size={16} className="text-primary-500" />
                  <span className="text-[10px] text-neutral-500 font-medium">
                    {label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Description / Specs / Warranty ───────────────────────────────── */}
        <ProductTabs product={product} />

        {/* ── Reviews ───────────────────────────────────────────────────────── */}
        <div className="mt-10 pt-8 border-t border-neutral-200">
          <h2 className="text-lg font-bold text-neutral-800 mb-4">Customer Reviews</h2>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <StarRating value={Math.round(avgRating)} size={16} />
              <span className="text-sm font-semibold text-neutral-700">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-neutral-400">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {canReview && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 space-y-3"
            >
              <p className="text-sm font-semibold text-neutral-700">Write a review</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button type="button" key={i} onClick={() => setReviewRating(i + 1)}>
                    <Star
                      size={22}
                      className={i < reviewRating ? "text-amber-400 fill-amber-400" : "text-neutral-200 fill-neutral-200"}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Share your thoughts about this product… (optional)"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-all resize-none"
              />
              {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
              <button
                type="submit"
                disabled={submittingReview}
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
              >
                {submittingReview ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          )}

          {myReview && (
            <p className="mb-6 text-xs text-emerald-600 font-medium">
              ✓ You've reviewed this product.
            </p>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-neutral-400">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} />
                    <span className="text-xs font-semibold text-neutral-700">{r.customer_name}</span>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-neutral-600 mt-2 whitespace-pre-line">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
