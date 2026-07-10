import { createSlice, current } from "@reduxjs/toolkit";
import { productThumb } from "../utils/imageUrl";

const KEY = "sf_wishlist";

const load = () => {
  try {
    const r = localStorage.getItem(KEY);
    return r ? JSON.parse(r) : { items: [] };
  } catch { return { items: [] }; }
};

const persist = (state) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(current(state)));
  } catch (_) {}
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: load(),
  reducers: {
    toggleWishlist: (state, { payload: product }) => {
      const idx = state.items.findIndex((i) => i.id === product.id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push({
          id: product.id,
          name: product.display_name,
          price: product.discount_price ?? product.regular_price,
          regular_price: product.regular_price,
          image: productThumb(product) ?? null,
          category: product.Category?.name || null,
        });
      }
      persist(state);
    },
    removeFromWishlist: (state, { payload: id }) => {
      state.items = state.items.filter((i) => i.id !== id);
      persist(state);
    },
  },
});

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsWishlisted  = (id) => (state) => state.wishlist.items.some((i) => i.id === id);
