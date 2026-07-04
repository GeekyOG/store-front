import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingCart, Trash2, Plus, Minus, Package,
  ArrowRight, ChevronRight, Heart,
} from "lucide-react";
import {
  selectCartItems, selectCartTotal,
  removeFromCart, updateQuantity, clearCart,
} from "../store/cartSlice";
import { toggleWishlist, selectIsWishlisted } from "../store/wishlistSlice";

function CartItem({ item }) {
  const dispatch   = useDispatch();
  const wishlisted = useSelector(selectIsWishlisted(item.id));

  const remove = () => dispatch(removeFromCart({ id: item.id, optKey: item.optKey }));
  const setQty = (q) => dispatch(updateQuantity({ id: item.id, optKey: item.optKey, quantity: q }));
  const moveToWishlist = () => {
    dispatch(toggleWishlist({
      id: item.id,
      display_name: item.name,
      discount_price: item.price !== item.regular_price ? item.price : undefined,
      regular_price: item.regular_price,
      featured_image: item.image,
    }));
    remove();
  };

  const options = Object.entries(item.selectedOptions ?? {});

  return (
    <div className="flex gap-4 py-5 border-b border-neutral-100 last:border-0">
      {/* Image */}
      <Link to={`/products/${item.id}`} className="shrink-0">
        <div className="h-20 w-20 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100">
          {item.image ? (
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Package size={24} className="text-neutral-200" />
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.id}`}
          className="text-sm font-semibold text-neutral-800 hover:text-primary-600 transition-colors line-clamp-2"
        >
          {item.name}
        </Link>
        {options.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {options.map(([k, v]) => (
              <span key={k} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                {k}: {v}
              </span>
            ))}
          </div>
        )}
        <p className="text-base font-bold text-primary-600 mt-1.5">
          ₦{(item.price * item.quantity).toLocaleString()}
        </p>
        {item.price !== item.regular_price && (
          <p className="text-xs text-neutral-400">
            ₦{item.price.toLocaleString()} × {item.quantity}
          </p>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-3 mt-3">
          {/* Qty controls */}
          <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setQty(item.quantity - 1)}
              className="px-2.5 py-1 text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="px-3 py-1 text-sm font-semibold text-neutral-800 min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => setQty(item.quantity + 1)}
              disabled={item.quantity >= item.maxQty}
              className="px-2.5 py-1 text-neutral-500 hover:bg-neutral-50 transition-colors disabled:opacity-40"
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            onClick={moveToWishlist}
            className={`flex items-center gap-1 text-xs transition-colors ${
              wishlisted ? "text-red-400" : "text-neutral-400 hover:text-red-400"
            }`}
          >
            <Heart size={12} fill={wishlisted ? "currentColor" : "none"} />
            {wishlisted ? "In wishlist" : "Save"}
          </button>

          <button
            onClick={remove}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-500 transition-colors ml-auto"
          >
            <Trash2 size={12} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const items     = useSelector(selectCartItems);
  const subtotal  = useSelector(selectCartTotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-5">
          <ShoppingCart size={32} className="text-neutral-300" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800">Your cart is empty</h1>
        <p className="text-neutral-500 mt-2 text-sm">
          You haven&apos;t added anything yet. Browse our products and find something you love.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow-sm"
        >
          <ShoppingCart size={15} />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight size={11} />
        <span className="text-neutral-600">Cart</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-800">
          Shopping Cart
          <span className="ml-2 text-sm font-normal text-neutral-400">
            ({items.length} item{items.length !== 1 ? "s" : ""})
          </span>
        </h1>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-200 px-5 divide-y-0">
            {items.map((item) => (
              <CartItem key={`${item.id}-${item.optKey}`} item={item} />
            ))}
          </div>

          <div className="mt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline font-medium"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-neutral-800">Order Summary</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">--</span>
              </div>
              <div className="border-t border-neutral-100 pt-2.5 flex justify-between font-bold text-neutral-800 text-base">
                <span>Total</span>
                <span className="text-primary-600">₦{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow-sm"
            >
              Proceed to Checkout
              <ArrowRight size={15} />
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {["Secure", "Encrypted", "Protected"].map((t) => (
                <span key={t} className="text-[10px] text-neutral-400 font-medium">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
