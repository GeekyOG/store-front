import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "https://api.myflexishop.com/api/v1";
// const BASE_URL = "http://localhost:8000/api/v1";

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
  tagTypes: [
    "Product",
    "Cms",
    "Categories",
    "Customer",
    "ShippingFee",
    "Kyc",
    "Orders",
    "Wallet",
  ],
  endpoints: (builder) => ({
    // ── Products ──────────────────────────────────────────────────────────────
    getPublicProducts: builder.query({
      query: (params) => ({ url: "/storefront/public/products", params }),
      providesTags: ["Product"],
    }),
    getPublicProduct: builder.query({
      query: (id) => `/storefront/public/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
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
      query: (body) => ({
        url: "/storefront/public/contact",
        method: "POST",
        body,
      }),
    }),

    // ── Customer auth ─────────────────────────────────────────────────────────
    register: builder.mutation({
      query: (body) => ({
        url: "/storefront/auth/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: "/storefront/auth/login",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/storefront/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/storefront/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query({
      query: () => "/storefront/auth/me",
      providesTags: ["Customer"],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/storefront/auth/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),
    updatePassword: builder.mutation({
      query: (body) => ({
        url: "/storefront/auth/password",
        method: "PUT",
        body,
      }),
    }),
    getReferralSummary: builder.query({
      query: () => "/storefront/auth/referrals",
      providesTags: ["Customer"],
    }),

    // ── KYC ───────────────────────────────────────────────────────────────────
    getMyKyc: builder.query({
      query: () => "/storefront/kyc/me",
      providesTags: ["Kyc"],
    }),
    submitKyc: builder.mutation({
      query: (formData) => ({
        url: "/storefront/kyc",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Kyc"],
    }),
    resubmitKyc: builder.mutation({
      query: (formData) => ({
        url: "/storefront/kyc",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Kyc"],
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
      query: (body) => ({
        url: "/storefront/discount-codes/validate",
        method: "POST",
        body,
      }),
    }),

    // ── Payments: Paystack ───────────────────────────────────────────────────
    initializePaystackPayment: builder.mutation({
      query: (body) => ({
        url: "/storefront/payments/paystack/initialize",
        method: "POST",
        body,
      }),
    }),
    verifyPaystackPayment: builder.mutation({
      query: (reference) => ({
        url: `/storefront/payments/paystack/verify/${reference}`,
        method: "GET",
      }),
    }),

    // ── Wallet ───────────────────────────────────────────────────────────────
    getWallet: builder.query({
      query: () => "/storefront/wallet",
      providesTags: ["Wallet"],
    }),
    getWalletTransactions: builder.query({
      query: (params) => ({ url: "/storefront/wallet/transactions", params }),
      providesTags: ["Wallet"],
    }),
    initializeWalletTopup: builder.mutation({
      query: (body) => ({
        url: "/storefront/wallet/topup",
        method: "POST",
        body,
      }),
    }),
    verifyWalletTopup: builder.mutation({
      query: (reference) => ({
        url: `/storefront/wallet/topup/verify/${reference}`,
        method: "GET",
      }),
      invalidatesTags: ["Wallet"],
    }),
    retryDedicatedAccount: builder.mutation({
      query: () => ({
        url: "/storefront/wallet/dedicated-account/retry",
        method: "POST",
      }),
      invalidatesTags: ["Wallet"],
    }),
    payOrderWithWallet: builder.mutation({
      query: (body) => ({
        url: "/storefront/payments/wallet/pay",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet", "Orders"],
    }),

    // ── Delivery (priced live by MDS) ───────────────────────────────────────
    getDeliveryOptions: builder.mutation({
      query: (body) => ({
        url: "/storefront/public/delivery/options",
        method: "POST",
        body,
      }),
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
      query: (body) => ({
        url: "/storefront/public/swap-quote",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetPublicProductsQuery,
  useGetPublicProductQuery,
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
  useGetMyKycQuery,
  useSubmitKycMutation,
  useResubmitKycMutation,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByNumberQuery,
  useValidateDiscountCodeMutation,
  useGetDeliveryOptionsMutation,
  useInitializePaystackPaymentMutation,
  useVerifyPaystackPaymentMutation,
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useInitializeWalletTopupMutation,
  useVerifyWalletTopupMutation,
  useRetryDedicatedAccountMutation,
  usePayOrderWithWalletMutation,
  useGetSwapModelsQuery,
  useGetSwapTargetProductsQuery,
  useGetSwapOptionsQuery,
  useGetSwapQuoteMutation,
} = storefrontApi;
