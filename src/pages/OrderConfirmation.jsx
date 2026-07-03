import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  CheckCircle, Package, MapPin, CreditCard,
  Copy, Check, ShoppingBag, ChevronRight, Loader2,
} from "lucide-react";
import {
  useGetOrderByNumberQuery, useVerifyPaystackPaymentMutation, useInitializePaystackPaymentMutation,
} from "../api/storefrontApi";
import { useSelector } from "react-redux";
import { selectCurrentCustomer } from "../store/authSlice";

const PAYMENT_LABELS = {
  paystack: "Card (Paystack)",
  bank_transfer: "Bank Transfer",
  pay_on_delivery: "Pay on Delivery",
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="ml-2 text-primary-500 hover:text-primary-700 transition-colors"
      title="Copy order number"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const customer = useSelector(selectCurrentCustomer);

  const emailParam = searchParams.get("email");
  // Paystack appends both of these to the callback URL on redirect.
  const paystackReference = searchParams.get("reference") || searchParams.get("trxref");

  const { data, isLoading, isError, refetch } = useGetOrderByNumberQuery(
    { orderNumber, email: customer ? undefined : emailParam },
    { skip: !orderNumber }
  );

  const [verifyPaystackPayment, { isLoading: verifying }] = useVerifyPaystackPaymentMutation();
  const [initializePaystackPayment, { isLoading: retrying }] = useInitializePaystackPaymentMutation();
  const [verifyError, setVerifyError] = useState("");
  const [retryError, setRetryError] = useState("");
  const hasVerified = useRef(false);

  const order = data?.order;

  // The webhook is the source of truth for marking an order paid, but it can
  // land seconds after this redirect — verify here too so the customer sees
  // "paid" immediately instead of a stale "pending" status. Idempotent on the
  // backend, so this racing with the webhook is harmless either way.
  useEffect(() => {
    if (!order || !paystackReference || hasVerified.current) return;
    if (order.payment_method !== "paystack" || order.payment_status === "paid") return;

    hasVerified.current = true;
    verifyPaystackPayment(paystackReference)
      .unwrap()
      .then(() => refetch())
      .catch((err) => setVerifyError(err?.data?.message ?? "Could not confirm payment status."));
  }, [order, paystackReference, verifyPaystackPayment, refetch]);

  const handleCompletePayment = async () => {
    if (!order) return;
    setRetryError("");
    try {
      const res = await initializePaystackPayment({
        order_number: order.order_number,
        email: order.shipping_email,
      }).unwrap();
      window.location.href = res.authorization_url;
    } catch (err) {
      setRetryError(err?.data?.message ?? "Could not start payment. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 rounded-full border-2 border-neutral-200 border-t-primary-500 animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <Package size={28} className="text-neutral-300" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Order not found</h2>
        <p className="text-neutral-500 text-sm mt-2">
          Order <span className="font-mono font-semibold">{orderNumber}</span> could not be found.
        </p>
        <Link to="/" className="mt-5 inline-block text-primary-600 hover:underline text-sm">
          Back to Home
        </Link>
      </div>
    );
  }

  const paymentLabel = PAYMENT_LABELS[order.payment_method] ?? order.payment_method;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight size={11} />
        <span className="text-neutral-600">Order Confirmation</span>
      </div>

      {/* Success hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center mb-6">
        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
          {verifying ? (
            <Loader2 size={32} className="text-white animate-spin" />
          ) : (
            <CheckCircle size={32} className="text-white" />
          )}
        </div>
        <h1 className="text-2xl font-extrabold">
          {verifying ? "Confirming Payment…" : "Order Placed!"}
        </h1>
        <p className="text-primary-100 mt-1 text-sm">
          Thank you {order.shipping_name?.split(" ")[0]}! We've received your order.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
          <span className="text-xs text-primary-100">Order Number</span>
          <span className="font-mono font-bold text-white text-sm">{order.order_number}</span>
          <CopyButton text={order.order_number} />
        </div>
      </div>

      {verifyError && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          {verifyError} Your payment may still be confirmed shortly — refresh this page to check.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Order items */}
        <div className="sm:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <h2 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <ShoppingBag size={15} className="text-primary-500" />
            Items Ordered
          </h2>
          <div className="divide-y divide-neutral-100">
            {(order.StorefrontOrderItems ?? []).map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package size={20} className="text-neutral-200" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 line-clamp-1">{item.product_name}</p>
                  {item.selected_options && (() => {
                    try {
                      const opts = JSON.parse(item.selected_options);
                      return Object.entries(opts).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full mr-1">
                          {k}: {v}
                        </span>
                      ));
                    } catch { return null; }
                  })()}
                  <p className="text-xs text-neutral-500 mt-1">
                    ₦{item.unit_price?.toLocaleString()} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-neutral-800 shrink-0">
                  ₦{item.subtotal?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>₦{order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Shipping</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between font-bold text-neutral-800 text-base">
              <span>Total</span>
              <span className="text-primary-600">₦{order.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping info */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h2 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-2">
            <MapPin size={15} className="text-primary-500" />
            Shipping To
          </h2>
          <p className="text-sm font-semibold text-neutral-800">{order.shipping_name}</p>
          <p className="text-sm text-neutral-500 mt-0.5">{order.shipping_email}</p>
          <p className="text-sm text-neutral-500">{order.shipping_phone}</p>
          <p className="text-sm text-neutral-500 mt-2">
            {order.shipping_address}<br />
            {order.shipping_city}, {order.shipping_state}
          </p>
          {order.notes && (
            <p className="text-xs text-neutral-400 italic mt-2">Note: {order.notes}</p>
          )}
        </div>

        {/* Payment info */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h2 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-2">
            <CreditCard size={15} className="text-primary-500" />
            Payment
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Method</span>
              <span className="font-semibold text-neutral-800">{paymentLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Status</span>
              <span className={`font-semibold capitalize ${
                order.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"
              }`}>
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Order Status</span>
              <span className="font-semibold text-neutral-800 capitalize">{order.status}</span>
            </div>
          </div>

          {order.payment_method === "bank_transfer" && order.payment_status !== "paid" && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              Please complete your bank transfer to confirm this order.
            </div>
          )}

          {order.payment_method === "paystack" && order.payment_status !== "paid" && !verifying && (
            <div className="mt-3 space-y-2">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                Payment was not completed for this order.
              </div>
              {retryError && <p className="text-xs text-red-500">{retryError}</p>}
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={retrying}
                className="w-full rounded-xl bg-primary-600 py-2.5 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
              >
                {retrying ? "Redirecting…" : "Complete Payment"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/products"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow-sm"
        >
          <ShoppingBag size={15} />
          Continue Shopping
        </Link>
        {customer && (
          <Link
            to="/my-orders"
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            View My Orders
          </Link>
        )}
      </div>
    </div>
  );
}
