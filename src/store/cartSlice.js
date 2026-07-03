import { createSlice, current } from "@reduxjs/toolkit";

const KEY = "sf_cart";

const load = () => {
  try {
    const r = localStorage.getItem(KEY);
    return r ? JSON.parse(r) : { items: [] };
  } catch { return { items: [] }; }
};

// current() extracts a plain object from the Immer draft so JSON.stringify works reliably.
// We strip `image` (base64) before writing to avoid localStorage quota errors.
const persist = (state) => {
  try {
    const snap = current(state).items.map(({ image: _img, ...rest }) => rest);
    localStorage.setItem(KEY, JSON.stringify({ items: snap }));
  } catch (_) {}
};

const cartSlice = createSlice({
  name: "cart",
  initialState: load(),
  reducers: {
    addToCart: (state, { payload }) => {
      const { product, selectedOptions = {}, quantity = 1 } = payload;
      const optKey = JSON.stringify(selectedOptions);
      const price = product.discount_price ?? product.regular_price;
      const maxQty = product.is_serialized ? 1 : (product.online_quantity ?? 99);
      const existing = state.items.find(
        (i) => i.id === product.id && i.optKey === optKey
      );
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, maxQty);
      } else {
        state.items.push({
          id: product.id,
          name: product.display_name,
          price,
          regular_price: product.regular_price,
          image: product.featured_image || product.StorefrontImages?.[0]?.image_data || null,
          selectedOptions,
          optKey,
          quantity: Math.min(quantity, maxQty),
          is_serialized: !!product.is_serialized,
          maxQty,
        });
      }
      persist(state);
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter(
        (i) => !(i.id === payload.id && i.optKey === payload.optKey)
      );
      persist(state);
    },
    updateQuantity: (state, { payload }) => {
      const item = state.items.find(
        (i) => i.id === payload.id && i.optKey === payload.optKey
      );
      if (item) {
        item.quantity = Math.max(1, Math.min(payload.quantity, item.maxQty));
      }
      persist(state);
    },
    clearCart: (state) => {
      state.items = [];
      persist(state);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
export const selectCartItems  = (state) => state.cart.items;
export const selectCartCount  = (state) => state.cart.items.reduce((s, i) => s + i.quantity, 0);
export const selectCartTotal  = (state) => state.cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
export const selectIsInCart   = (id) => (state) => state.cart.items.some((i) => i.id === id);
