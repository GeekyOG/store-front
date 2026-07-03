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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useGetPublicProductQuery } from "../api/storefrontApi";
import { addToCart, selectCartItems } from "../store/cartSlice";
import { toggleWishlist, selectIsWishlisted } from "../store/wishlistSlice";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: product, isLoading } = useGetPublicProductQuery(id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const cartItems = useSelector(selectCartItems);
  const wishlisted = useSelector(selectIsWishlisted(Number(id)));

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
    ...(product.featured_image ? [{ image_data: product.featured_image }] : []),
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
  const maxQty = product.is_serialized ? 1 : Math.min(stockCount, 99);

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
                  src={allImages[selectedImage]?.image_data}
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
                      src={img.image_data}
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
            {inStock && !product.is_serialized && (
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

            {/* Full description */}
            {product.full_description && (
              <div className="pt-4 border-t border-neutral-200">
                <h3 className="mb-2 text-sm font-semibold text-neutral-700">
                  Description
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-line">
                  {product.full_description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
