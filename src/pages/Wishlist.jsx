import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Heart, ShoppingCart, Trash2, Package, ChevronRight } from "lucide-react";
import { selectWishlistItems, removeFromWishlist } from "../store/wishlistSlice";
import { addToCart, selectIsInCart } from "../store/cartSlice";

function WishlistItem({ item }) {
  const dispatch = useDispatch();
  const inCart   = useSelector(selectIsInCart(item.id));

  const handleAddToCart = () => {
    dispatch(addToCart({
      product: {
        id: item.id,
        display_name: item.name,
        regular_price: item.regular_price,
        discount_price: item.price !== item.regular_price ? item.price : null,
        featured_image: item.image,
        online_quantity: 99,
        is_serialized: false,
        StorefrontVariants: [],
      },
      selectedOptions: {},
      quantity: 1,
    }));
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-neutral-100 last:border-0">
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

      <div className="flex-1 min-w-0">
        {item.category && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 mb-0.5">
            {item.category}
          </p>
        )}
        <Link
          to={`/products/${item.id}`}
          className="text-sm font-semibold text-neutral-800 hover:text-primary-600 transition-colors line-clamp-2"
        >
          {item.name}
        </Link>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-bold text-primary-600">
            ₦{item.price?.toLocaleString()}
          </span>
          {item.price !== item.regular_price && (
            <span className="text-xs text-neutral-400 line-through">
              ₦{item.regular_price?.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleAddToCart}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
            inCart
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-primary-50 text-primary-600 border border-primary-100 hover:bg-primary-100"
          }`}
        >
          <ShoppingCart size={13} />
          {inCart ? "In Cart" : "Add to Cart"}
        </button>
        <button
          onClick={() => dispatch(removeFromWishlist(item.id))}
          className="p-2 text-neutral-300 hover:text-red-400 transition-colors"
          title="Remove from wishlist"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const items = useSelector(selectWishlistItems);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight size={11} />
        <span className="text-neutral-600">Wishlist</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
          <Heart size={18} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-800">My Wishlist</h1>
          <p className="text-sm text-neutral-400">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-red-200" />
          </div>
          <p className="text-neutral-500 font-medium">Your wishlist is empty</p>
          <p className="text-sm text-neutral-400 mt-1">
            Tap the heart on any product to save it here.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 px-5">
          {items.map((item) => (
            <WishlistItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
