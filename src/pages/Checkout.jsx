import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight, Package, CreditCard, Truck,
  MapPin, Lock, AlertCircle, Tag, X, Check, Minus, Plus, Gift,
  ShieldCheck, Clock, Landmark, Store,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectCartItems, selectCartTotal, clearCart, removeFromCart, updateQuantity } from "../store/cartSlice";
import { selectCurrentCustomer } from "../store/authSlice";
import {
  usePlaceOrderMutation, useValidateDiscountCodeMutation, useGetShippingFeesQuery,
  useInitializePaystackPaymentMutation, useGetMeQuery, storefrontApi,
} from "../api/storefrontApi";
import { NIGERIA_STATES } from "../constants/nigeriaStates";
import { getVariantStockCount } from "../utils/variantStock";

const STORE_PICKUP = {
  address: "Okorodafe Roundabout, Market Rd",
  cityState: "Oteri 333105, Delta, Nigeria",
  hours: "Mon–Sat, 9am–6pm",
};

const BANK_ACCOUNTS = [
  {
    name: "SAMMYYMOBILES TECH",
    account: "5804954840",
    bank: "Monie Point",
  },
  {
    name: "Sammyymobiles Tech",
    account: "1012783602",
    bank: "Keystone Bank",
  },
];

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function WarrantyModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="px-7 pt-9 pb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10b98118]">
            <ShieldCheck size={26} style={{ color: "#10b981" }} />
          </div>

          <h2 className="flex items-center justify-center gap-2 text-lg font-extrabold text-neutral-800">
            <span>🛡️</span> Warranty Policy
          </h2>

          <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
            Every order is covered. If a product develops a fault under
            normal use within its warranty period, contact us for a repair,
            replacement, or refund at our discretion.
          </p>

          <div className="mt-6 flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-3">
            {[
              { Icon: Clock, label: "14 Days — UK-Used Phones" },
              { Icon: Package, label: "30 Days — Brand New Phones" },
              { Icon: AlertCircle, label: "Excludes Liquid & Screen Damage" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex flex-1 flex-col items-center gap-1.5 px-1"
              >
                <Icon size={18} style={{ color: "#10b981" }} />
                <span className="text-[11px] font-medium text-neutral-600 leading-tight text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90"
            style={{ background: "#10b981" }}
          >
            Got It, Continue Checkout
          </button>

          <Link
            to="/terms-and-conditions"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
          >
            View full warranty &amp; returns policy <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputCls = (err) =>
  `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all bg-white focus:ring-2 focus:ring-primary-50 ${
    err ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-primary-400"
  }`;

const WARRANTY_POPUP_SHOWN_KEY = "sf_checkout_warranty_shown";

export default function Checkout() {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const authCustomer  = useSelector(selectCurrentCustomer);
  const items         = useSelector(selectCartItems);
  const subtotal      = useSelector(selectCartTotal);

  // authCustomer (from Redux/localStorage) can be stale after an Account page
  // edit — that page's own view refreshes via RTK cache invalidation, but
  // this page never re-reads it. Refetch here so a saved address prefills
  // correctly without requiring the customer to log out and back in.
  const { data: freshCustomer } = useGetMeQuery(undefined, { skip: !authCustomer });
  const customer = freshCustomer ?? authCustomer;

  const [placeOrder, { isLoading }] = usePlaceOrderMutation();
  const [validateDiscountCode, { isLoading: validatingPromo }] = useValidateDiscountCodeMutation();
  const [initializePaystackPayment, { isLoading: initializingPayment }] = useInitializePaystackPaymentMutation();
  const { data: shippingFees } = useGetShippingFeesQuery();

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount_amount }

  const referralBalance = Number(customer?.referral_balance ?? 0);
  const [useReferralBalance, setUseReferralBalance] = useState(false);
  const [referralAmountInput, setReferralAmountInput] = useState("");

  const [form, setForm] = useState({
    first_name: customer?.first_name   ?? "",
    last_name:  customer?.last_name    ?? "",
    email:      customer?.email        ?? "",
    phone:      customer?.phone_number ?? "",
    address:    customer?.address      ?? "",
    city:       customer?.city         ?? "",
    state:      customer?.state        ?? "",
    notes:      "",
  });
  const [payment, setPayment] = useState("paystack");
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const isPickup = deliveryMethod === "pickup";
  const [errors,  setErrors]  = useState({});
  const [serverError, setServerError] = useState("");
  const [checkingStock, setCheckingStock] = useState(false);
  const [showWarranty, setShowWarranty] = useState(false);

  // Shown once per session so returning to checkout (e.g. after tweaking the
  // cart) doesn't interrupt the customer with the same popup every time.
  useEffect(() => {
    if (sessionStorage.getItem(WARRANTY_POPUP_SHOWN_KEY)) return;
    sessionStorage.setItem(WARRANTY_POPUP_SHOWN_KEY, "1");
    setShowWarranty(true);
  }, []);

  // The initial useState above only had the (possibly stale) Redux customer
  // to work with. Reconcile once the freshest profile arrives — but only
  // once, so a background refetch never clobbers what the customer is typing.
  const hasHydratedProfile = useRef(false);
  useEffect(() => {
    if (hasHydratedProfile.current || !freshCustomer) return;
    hasHydratedProfile.current = true;
    setForm((f) => ({
      ...f,
      first_name: freshCustomer.first_name   ?? f.first_name,
      last_name:  freshCustomer.last_name    ?? f.last_name,
      email:      freshCustomer.email        ?? f.email,
      phone:      freshCustomer.phone_number ?? f.phone,
      address:    freshCustomer.address      ?? f.address,
      city:       freshCustomer.city         ?? f.city,
      state:      freshCustomer.state        ?? f.state,
    }));
  }, [freshCustomer]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const changeItemQty = (item, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart({ id: item.id, optKey: item.optKey }));
    } else {
      dispatch(updateQuantity({ id: item.id, optKey: item.optKey, quantity }));
    }
  };

  // Guest order lookups need the shipping email to prove ownership (see
  // getOrderByNumber); logged-in customers are matched by their account instead.
  const confirmationPath = (orderNumber) =>
    customer
      ? `/order-confirmation/${orderNumber}`
      : `/order-confirmation/${orderNumber}?email=${encodeURIComponent(form.email.trim())}`;

  const discountAmount = appliedPromo?.discount_amount ?? 0;
  const maxReferralUsable = Math.max(Math.min(referralBalance, subtotal - discountAmount), 0);
  const referralAmount = useReferralBalance
    ? Math.max(0, Math.min(Number(referralAmountInput) || 0, maxReferralUsable))
    : 0;
  const shippingFee = isPickup ? 0 : (shippingFees?.find((f) => f.state === form.state)?.fee ?? 0);
  const total = Math.max(subtotal - discountAmount - referralAmount + shippingFee, 0);

  const handleToggleReferralBalance = () => {
    setUseReferralBalance((prev) => {
      const next = !prev;
      if (next) setReferralAmountInput(String(maxReferralUsable));
      return next;
    });
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoError("");
    try {
      const res = await validateDiscountCode({ code, subtotal }).unwrap();
      setAppliedPromo({ code: res.code, discount_amount: res.discount_amount });
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err?.data?.message ?? "Invalid discount code.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-neutral-500">Your cart is empty.</p>
        <Link to="/products" className="mt-4 inline-block text-primary-600 hover:underline text-sm">
          Browse Products
        </Link>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Required";
    if (!form.last_name.trim())  e.last_name  = "Required";
    if (!form.email.trim())      e.email      = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim())    e.phone    = "Required";
    if (!isPickup) {
      if (!form.address.trim()) e.address = "Required";
      if (!form.city.trim())    e.city    = "Required";
      if (!form.state.trim())   e.state   = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Cart quantities/caps are snapshotted at add-to-cart time and can go stale
  // (stock sold out from under the customer while the cart sat idle). Re-fetch
  // live stock for every line item right before submitting so the order can
  // never request more than what's actually available in store.
  const reconcileStockWithCart = async () => {
    const uniqueIds = [...new Set(items.map((i) => i.id))];
    const productsById = new Map();
    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const product = await dispatch(
            storefrontApi.endpoints.getPublicProduct.initiate(id, { forceRefetch: true }),
          ).unwrap();
          productsById.set(id, product);
        } catch {
          // Backend will still reject an over-order as a final safety net.
        }
      }),
    );

    const changes = [];
    for (const item of items) {
      const product = productsById.get(item.id);
      if (!product) continue;
      const available = getVariantStockCount(product, item.selectedOptions);
      if (item.quantity > available) {
        if (available <= 0) {
          dispatch(removeFromCart({ id: item.id, optKey: item.optKey }));
          changes.push(`${item.name} sold out and was removed from your cart.`);
        } else {
          dispatch(updateQuantity({ id: item.id, optKey: item.optKey, quantity: available }));
          changes.push(`${item.name} quantity was reduced to ${available} (only ${available} left in stock).`);
        }
      }
    }
    return changes;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setServerError("");

    setCheckingStock(true);
    const stockChanges = await reconcileStockWithCart();
    setCheckingStock(false);
    if (stockChanges.length > 0) {
      setServerError(`${stockChanges.join(" ")} Please review your cart before placing the order.`);
      return;
    }

    try {
      const payload = {
        items: items.map((i) => ({
          storefrontProductId: i.id,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions ?? {},
        })),
        shipping: {
          name:    `${form.first_name.trim()} ${form.last_name.trim()}`,
          email:   form.email.trim(),
          phone:   form.phone.trim(),
          address: form.address.trim(),
          city:    form.city.trim(),
          state:   form.state.trim(),
        },
        payment_method: payment,
        delivery_method: deliveryMethod,
        notes: form.notes.trim() || undefined,
        coupon_code: appliedPromo?.code || undefined,
        referral_amount: referralAmount > 0 ? referralAmount : undefined,
      };
      const res = await placeOrder(payload).unwrap();
      dispatch(clearCart());

      if (payment === "paystack") {
        try {
          const paystackRes = await initializePaystackPayment({
            order_number: res.order.order_number,
            email: form.email.trim(),
          }).unwrap();
          window.location.href = paystackRes.authorization_url;
          return;
        } catch {
          // Order was already created — send the customer to the confirmation
          // page, where they can retry payment instead of losing the order.
          navigate(confirmationPath(res.order.order_number));
          return;
        }
      }

      navigate(confirmationPath(res.order.order_number));
    } catch (err) {
      setServerError(err?.data?.message ?? "Failed to place order. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight size={11} />
        <Link to="/cart" className="hover:text-primary-600 transition-colors">Cart</Link>
        <ChevronRight size={11} />
        <span className="text-neutral-600">Checkout</span>
      </div>

      <h1 className="text-xl font-bold text-neutral-800 mb-6">Checkout</h1>

      {serverError && (
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* ── Left: form ────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Delivery Method */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Truck size={16} className="text-primary-500" />
                <h2 className="text-sm font-bold text-neutral-800">Delivery Method</h2>
              </div>

              {[
                {
                  value: "delivery",
                  label: "Ship to Address",
                  desc: "Delivered to your address",
                  icon: Truck,
                },
                {
                  value: "pickup",
                  label: "Store Pickup",
                  desc: "Collect from our store, free of charge",
                  icon: Store,
                },
              ].map(({ value, label, desc, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    deliveryMethod === value
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={value}
                    checked={deliveryMethod === value}
                    onChange={() => setDeliveryMethod(value)}
                    className="accent-primary-600"
                  />
                  <div className="h-9 w-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{label}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}

              {isPickup && (
                <div className="rounded-xl bg-primary-50 border border-primary-200 p-4 space-y-1">
                  <p className="text-xs font-bold text-primary-800 uppercase tracking-wide">Pickup Location</p>
                  <p className="text-sm text-primary-900">{STORE_PICKUP.address}</p>
                  <p className="text-sm text-primary-900">{STORE_PICKUP.cityState}</p>
                  <p className="text-xs text-primary-700 mt-2">Pickup hours: {STORE_PICKUP.hours}</p>
                </div>
              )}
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-primary-500" />
                <h2 className="text-sm font-bold text-neutral-800">
                  {isPickup ? "Contact Information" : "Shipping Information"}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" error={errors.first_name} required>
                  <input value={form.first_name} onChange={set("first_name")} placeholder="John" className={inputCls(errors.first_name)} />
                </Field>
                <Field label="Last Name" error={errors.last_name} required>
                  <input value={form.last_name} onChange={set("last_name")} placeholder="Doe" className={inputCls(errors.last_name)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" error={errors.email} required>
                  <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputCls(errors.email)} />
                </Field>
                <Field label="Phone" error={errors.phone} required>
                  <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+234 800 000 0000" className={inputCls(errors.phone)} />
                </Field>
              </div>

              {!isPickup && (
                <>
                  <Field label="Delivery Address" error={errors.address} required>
                    <input value={form.address} onChange={set("address")} placeholder="123 Street Name" className={inputCls(errors.address)} />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City" error={errors.city} required>
                      <input value={form.city} onChange={set("city")} placeholder="Lagos" className={inputCls(errors.city)} />
                    </Field>
                    <Field label="State" error={errors.state} required>
                      <select value={form.state} onChange={set("state")} className={inputCls(errors.state)}>
                        <option value="">Select state…</option>
                        {NIGERIA_STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              )}

              <Field label="Order Notes (optional)">
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Any special instructions for your order…"
                  className={inputCls(false) + " resize-none"}
                />
              </Field>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={16} className="text-primary-500" />
                <h2 className="text-sm font-bold text-neutral-800">Payment Method</h2>
              </div>

              {[
                {
                  value: "paystack",
                  label: "Pay with Card",
                  desc: "Secure card payment via Paystack",
                  icon: CreditCard,
                },
                {
                  value: "bank_transfer",
                  label: "Bank Transfer",
                  desc: "Transfer directly to our bank account",
                  icon: Landmark,
                },
              ].map(({ value, label, desc, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    payment === value
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={payment === value}
                    onChange={() => setPayment(value)}
                    className="accent-primary-600"
                  />
                  <div className="h-9 w-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{label}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}

              {payment === "bank_transfer" && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Bank Details</p>
                  {BANK_ACCOUNTS.map((acct) => (
                    <div key={acct.account} className="space-y-1 border-b border-amber-200 last:border-b-0 pb-3 last:pb-0">
                      <p className="text-sm text-amber-900"><span className="font-semibold">Account Name:</span> {acct.name}</p>
                      <p className="text-sm text-amber-900"><span className="font-semibold">Account Number:</span> {acct.account}</p>
                      <p className="text-sm text-amber-900"><span className="font-semibold">Bank:</span> {acct.bank}</p>
                    </div>
                  ))}
                  <p className="text-xs text-amber-700 mt-2">
                    Transfer ₦{total.toLocaleString()} to either account above and use your order number as reference.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: summary ────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 bg-white rounded-2xl border border-neutral-200 p-5">
              <h2 className="text-sm font-bold text-neutral-800 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.id}-${item.optKey}`} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-neutral-50 border border-neutral-100 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package size={16} className="text-neutral-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-700 line-clamp-1">{item.name}</p>
                      {Object.entries(item.selectedOptions ?? {}).map(([k, v]) => (
                        <p key={k} className="text-[10px] text-neutral-400">{k}: {v}</p>
                      ))}
                      <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden mt-1 w-fit">
                        <button
                          type="button"
                          onClick={() => changeItemQty(item, item.quantity - 1)}
                          className="px-1.5 py-0.5 text-neutral-500 hover:bg-neutral-50 transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-2 py-0.5 text-xs font-semibold text-neutral-800 min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeItemQty(item, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQty}
                          className="px-1.5 py-0.5 text-neutral-500 hover:bg-neutral-50 transition-colors disabled:opacity-40"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-neutral-800 shrink-0">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="border-t border-neutral-100 mt-4 pt-4">
                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-700 truncate">
                        {appliedPromo.code} applied
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-500 shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                      <input
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Promo code"
                        className="w-full rounded-xl border border-neutral-200 pl-8 pr-3 py-2 text-xs outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-all uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={validatingPromo || !promoInput.trim()}
                      className="rounded-xl bg-neutral-800 px-4 text-xs font-semibold text-white hover:bg-neutral-900 disabled:opacity-50 transition-colors"
                    >
                      {validatingPromo ? "Checking…" : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && <p className="mt-1.5 text-xs text-red-500">{promoError}</p>}
              </div>

              {/* Referral balance */}
              {referralBalance > 0 && (
                <div className="border-t border-neutral-100 mt-4 pt-4">
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                      <Gift size={13} className="text-primary-500" />
                      Use referral balance (₦{referralBalance.toLocaleString()} available)
                    </span>
                    <input
                      type="checkbox"
                      checked={useReferralBalance}
                      onChange={handleToggleReferralBalance}
                      className="accent-primary-600 h-4 w-4"
                    />
                  </label>
                  {useReferralBalance && (
                    <div className="mt-2 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">₦</span>
                      <input
                        type="number"
                        min={0}
                        max={maxReferralUsable}
                        value={referralAmountInput}
                        onChange={(e) => setReferralAmountInput(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 pl-6 pr-3 py-2 text-xs outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-all"
                      />
                      <p className="mt-1 text-[10px] text-neutral-400">
                        Up to ₦{maxReferralUsable.toLocaleString()} can be applied to this order.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {referralAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Referral balance used</span>
                    <span>-₦{referralAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>{isPickup ? "Delivery" : `Shipping${form.state ? ` (${form.state})` : ""}`}</span>
                  {isPickup ? (
                    <span className="text-emerald-600 font-medium">Store Pickup</span>
                  ) : shippingFee > 0 ? (
                    <span>₦{shippingFee.toLocaleString()}</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">
                      {form.state ? "Free" : "Select a state"}
                    </span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-neutral-800 text-base pt-1 border-t border-neutral-100">
                  <span>Total</span>
                  <span className="text-primary-600">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || initializingPayment || checkingStock}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {isLoading || initializingPayment || checkingStock ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Lock size={14} />
                )}
                {checkingStock
                  ? "Checking availability…"
                  : isLoading
                    ? "Placing Order…"
                    : initializingPayment
                      ? "Redirecting to Paystack…"
                      : "Place Order"}
              </button>

              <button
                type="button"
                onClick={() => setShowWarranty(true)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-primary-600 transition-colors"
              >
                <ShieldCheck size={13} className="text-emerald-500" />
                Backed by our warranty policy
                <ChevronRight size={12} />
              </button>

              <p className="mt-2 text-[10px] text-neutral-400 text-center">
                By placing this order you agree to our Terms &amp; Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </form>

      {showWarranty && <WarrantyModal onClose={() => setShowWarranty(false)} />}
    </div>
  );
}
