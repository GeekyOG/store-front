import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const BASE_URL = "https://api.sammytechgadgets.com/api";
// export const BASE_URL = "http://localhost:8080/api";


export const storefrontApi = createApi({
  reducerPath: "storefrontApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Product", "Cms", "Categories", "Customer", "ShippingFee", "Review", "DiscountCode"],
  endpoints: (builder) => ({
    // ── Products ──────────────────────────────────────────────────────────────
    getPublicProducts: builder.query({
      query: (params) => ({ url: "/storefront/public/products", params }),
      providesTags: ["Product"],
    }),
    getPublicProduct: builder.query({
      query: (id) => `/storefront/public/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Product", id }, "Review"],
    }),
    addReview: builder.mutation({
      query: ({ productId, rating, comment }) => ({
        url: `/storefront/reviews/${productId}`,
        method: "POST",
        body: { rating, comment },
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: "Product", id: productId }, "Review"],
    }),
    getPublicCms: builder.query({
      query: () => "/storefront/cms",
      providesTags: ["Cms"],
    }),
    getPublicCategories: builder.query({
      query: () => "/storefront/public/categories",
      providesTags: ["Categories"],
    }),
    getPublicStorefrontSubcategories: builder.query({
      query: () => "/storefront-subcategories",
      providesTags: ["Categories"],
    }),
    submitContactMessage: builder.mutation({
      query: (body) => ({ url: "/storefront/public/contact", method: "POST", body }),
    }),

    // ── Customer auth ─────────────────────────────────────────────────────────
    register: builder.mutation({
      query: (body) => ({ url: "/storefront/auth/register", method: "POST", body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/storefront/auth/login", method: "POST", body }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "/storefront/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: "/storefront/auth/reset-password", method: "POST", body }),
    }),
    getMe: builder.query({
      query: () => "/storefront/auth/me",
      providesTags: ["Customer"],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: "/storefront/auth/profile", method: "PUT", body }),
      invalidatesTags: ["Customer"],
    }),
    updatePassword: builder.mutation({
      query: (body) => ({ url: "/storefront/auth/password", method: "PUT", body }),
    }),
    getReferralSummary: builder.query({
      query: () => "/storefront/auth/referrals",
      providesTags: ["Customer"],
    }),
    getMyDiscountCodes: builder.query({
      query: () => "/storefront/auth/discount-codes",
      providesTags: ["DiscountCode"],
    }),

    // ── Orders ──────────────────────────────────────────────────────────────
    placeOrder: builder.mutation({
      query: (body) => ({ url: "/storefront/orders", method: "POST", body }),
      invalidatesTags: ["Orders"],
    }),
    getMyOrders: builder.query({
      query: () => "/storefront/orders",
      providesTags: ["Orders"],
    }),
    getOrderByNumber: builder.query({
      query: ({ orderNumber, email }) => ({
        url: `/storefront/orders/${orderNumber}`,
        params: email ? { email } : undefined,
      }),
    }),

    // ── Discount codes ─────────────────────────────────────────────────────
    validateDiscountCode: builder.mutation({
      query: (body) => ({ url: "/storefront/discount-codes/validate", method: "POST", body }),
    }),

    // ── Payments: Paystack ───────────────────────────────────────────────────
    initializePaystackPayment: builder.mutation({
      query: (body) => ({ url: "/storefront/payments/paystack/initialize", method: "POST", body }),
    }),
    verifyPaystackPayment: builder.mutation({
      query: (reference) => ({ url: `/storefront/payments/paystack/verify/${reference}`, method: "GET" }),
    }),

    // ── Shipping fees ───────────────────────────────────────────────────────
    getShippingFees: builder.query({
      query: () => "/storefront/shipping-fees",
      providesTags: ["ShippingFee"],
    }),

    // ── Phone swap ──────────────────────────────────────────────────────────
    getSwapModels: builder.query({
      query: () => "/storefront/public/swap-models",
    }),
    getSwapTargetProducts: builder.query({
      query: () => "/storefront/public/swap-target-products",
    }),
    getSwapOptions: builder.query({
      query: () => "/storefront/public/swap-options",
    }),
    getSwapQuote: builder.mutation({
      query: (body) => ({ url: "/storefront/public/swap-quote", method: "POST", body }),
    }),
  }),
});

export const {
  useGetPublicProductsQuery,
  useGetPublicProductQuery,
  useAddReviewMutation,
  useGetPublicCmsQuery,
  useGetPublicCategoriesQuery,
  useGetPublicStorefrontSubcategoriesQuery,
  useSubmitContactMessageMutation,
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetReferralSummaryQuery,
  useGetMyDiscountCodesQuery,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByNumberQuery,
  useValidateDiscountCodeMutation,
  useGetShippingFeesQuery,
  useInitializePaystackPaymentMutation,
  useVerifyPaystackPaymentMutation,
  useGetSwapModelsQuery,
  useGetSwapTargetProductsQuery,
  useGetSwapOptionsQuery,
  useGetSwapQuoteMutation,
} = storefrontApi;
