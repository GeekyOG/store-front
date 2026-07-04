import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Package, Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { addToCart, removeFromCart, updateQuantity, selectCartItems } from "../store/cartSlice";
import { toggleWishlist, selectIsWishlisted } from "../store/wishlistSlice";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  // Cards only ever add the no-options variant ("{}") — products with real
  // variant choices route to the detail page instead (see hasVariants below).
  const cartItem = cartItems.find((i) => i.id === product.id && i.optKey === "{}");
  const cartQty = cartItem?.quantity ?? 0;
  const wishlisted = useSelector(selectIsWishlisted(product.id));

  const thumb =
    product.featured_image || product.StorefrontImages?.[0]?.image_data;
  const price = product.discount_price ?? product.regular_price;
  const hasDiscount = !!product.discount_price;
  const pct = hasDiscount
    ? Math.round((1 - product.discount_price / product.regular_price) * 100)
    : 0;
  // Only variants with actual selectable options require a trip to the detail page.
  const hasVariants = (product.StorefrontVariants ?? []).some(
    (v) => (v.StorefrontVariantOptions ?? []).length > 0
  );
  // For serialized products the API returns only available serials (filtered server-side),
  // so array length == available stock. Non-serialized uses online_quantity.
  const stockCount = product.is_serialized
    ? (product.StorefrontSerialNumbers?.length ?? 0)
    : (product.online_quantity ?? 0);
  const inStock = stockCount > 0;
  const maxQty = stockCount;

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    if (hasVariants) {
      // Variant options can only be picked on the detail page.
      navigate(`/products/${product.id}`);
    } else {
      dispatch(addToCart({ product, selectedOptions: {}, quantity: 1 }));
    }
  };

  const increment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartQty >= maxQty) return;
    dispatch(addToCart({ product, selectedOptions: {}, quantity: 1 }));
  };

  const decrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartQty <= 1) {
      dispatch(removeFromCart({ id: product.id, optKey: "{}" }));
    } else {
      dispatch(updateQuantity({ id: product.id, optKey: "{}", quantity: cartQty - 1 }));
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all duration-200"
    >
      <div className="relative aspect-square bg-neutral-50 overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={product.display_name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package size={36} className="text-neutral-200" />
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            -{pct}%
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 h-7 w-7 rounded-full shadow flex items-center justify-center transition-all ${
            wishlisted
              ? "bg-red-500 text-white scale-110"
              : "bg-white/90 text-neutral-400 hover:bg-white hover:text-red-500"
          }`}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={13} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-neutral-800/80 text-white text-[10px] font-bold px-3 py-1 rounded-full">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        {product.Category && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-600">
            {product.Category.name}
            {product.Subcategory && ` · ${product.Subcategory.name}`}
          </span>
        )}
        <h3 className="text-sm font-semibold text-neutral-700 line-clamp-2 leading-snug">
          {product.display_name}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base font-bold text-primary-600">
              ₦{price?.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through">
                ₦{product.regular_price?.toLocaleString()}
              </span>
            )}
          </div>
          {/* Cart button / quantity stepper */}
          {cartQty > 0 && !hasVariants ? (
            <div className="shrink-0 flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
              <button
                onClick={decrement}
                className="h-8 w-7 flex items-center justify-center hover:bg-emerald-100 rounded-l-xl transition-colors"
                title="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="min-w-[1rem] text-center text-xs font-bold tabular-nums">
                {cartQty}
              </span>
              <button
                onClick={increment}
                disabled={cartQty >= maxQty}
                className="h-8 w-7 flex items-center justify-center hover:bg-emerald-100 rounded-r-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleCart}
              disabled={!inStock}
              className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary-50 border-primary-100 text-primary-600 hover:bg-primary-100"
              title={hasVariants ? "Select options" : "Add to cart"}
            >
              <ShoppingCart size={14} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
