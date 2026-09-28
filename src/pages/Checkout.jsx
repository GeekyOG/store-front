import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight, Package, CreditCard, Truck,
  MapPin, Lock, AlertCircle, Tag, X, Check, Wallet,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectCartItems, selectCartTotal, clearCart } from "../store/cartSlice";
import { selectCurrentCustomer } from "../store/authSlice";
import {
  usePlaceOrderMutation, useValidateDiscountCodeMutation,
  useInitializePaystackPaymentMutation, useGetMeQuery, useGetDeliveryOptionsMutation,
  useGetWalletQuery, usePayOrderWithWalletMutation,
} from "../api/storefrontApi";
import { NIGERIA_STATES } from "../constants/nigeriaStates";
import { useGoogleMaps } from "../utils/useGoogleMaps";

// Pulls city/state out of a Google Places result. State is matched against
// our own dropdown list (case-insensitively) so the <select> reflects it;
// falls back to Google's raw name if it isn't an exact match.
function parseAddressComponents(components = []) {
  const find = (type) => components.find((c) => c.types.includes(type))?.long_name ?? "";
  const city = find("locality") || find("administrative_area_level_2");
  const rawState = find("administrative_area_level_1");
  const matchedState = NIGERIA_STATES.find((s) => s.toLowerCase() === rawState.toLowerCase());
  return { city, state: matchedState || rawState };
}

// Delivery quotes from MDS are valid for 30 minutes.
const QUOTE_TTL_MS = 30 * 60 * 1000;

const SERVICE_LABELS = { standard: "Standard", express: "Express", same_day: "Same Day", cargo: "Cargo" };

function formatEstimate(estimate) {
  if (!estimate || estimate.minHours == null || estimate.maxHours == null) return estimate?.description ?? "";
  const { minHours: min, maxHours: max } = estimate;
  if (min >= 24 && min % 24 === 0 && max % 24 === 0) return `${min / 24}–${max / 24} days`;
  return `${min}–${max} hrs`;
}

const BANK = {
  name: "MyFlexShop",
  account: "0123456789",
  bank: "First Bank Nigeria",
};

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

const inputCls = (err) =>
  `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all bg-white focus:ring-2 focus:ring-primary-50 ${
    err ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-primary-400"
  }`;

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
  const [getDeliveryOptions, { isLoading: isQuoting }] = useGetDeliveryOptionsMutation();
  const [payOrderWithWallet, { isLoading: payingWithWallet }] = usePayOrderWithWalletMutation();

  const { data: wallet } = useGetWalletQuery(undefined, { skip: !authCustomer });
  const walletBalance = Number(wallet?.wallet?.balance ?? 0);

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount_amount }

  // Delivery is priced live by Mustard Delivery Services (via our backend),
  // one option per speed the admin has enabled. Options only resolve once the
  // customer picks a Places suggestion with coordinates; until then (or if
  // quoting fails) ordering is blocked below.
  const addressInputRef = useRef(null);
  const googleLoaded = useGoogleMaps();
  const [destination, setDestination] = useState(null); // { lat, lng }
  const [serviceType, setServiceType] = useState("standard");
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [quotedAt, setQuotedAt] = useState(0);
  const [quoteError, setQuoteError] = useState("");
  const deliveryQuote = deliveryOptions.find((o) => o.serviceType === serviceType) ?? null;

  // Tracks the last address value we know came from the input's own native
  // 'input' event (a keystroke, or a nudge we dispatched ourselves below) —
  // used to tell "the user typed this" apart from "something else set this"
  // (browser autofill, profile hydration) so the latter can still trigger
  // Places suggestions instead of leaving the field silently unresolved.
  const typedAddressRef = useRef("");

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
  const [errors,  setErrors]  = useState({});
  const [serverError, setServerError] = useState("");

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

  // Attach Google Places Autocomplete to the address field once the SDK is
  // ready. Selecting a suggestion gives us coordinates for a live delivery
  // quote, plus city/state to keep the rest of the form in sync.
  useEffect(() => {
    const input = addressInputRef.current;
    if (!googleLoaded || !input) return;
    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: "ng" },
      fields: ["formatted_address", "address_components", "geometry"],
    });
    const placeListener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      if (!location) return; // customer typed Enter without picking a suggestion
      const { city, state } = parseAddressComponents(place.address_components);
      setForm((f) => {
        const address = place.formatted_address || f.address;
        typedAddressRef.current = address; // a deliberate pick, not a "change to react to"
        return { ...f, address, city: city || f.city, state: state || f.state };
      });
      setDestination({ lat: location.lat(), lng: location.lng() });
    });

    // Browser/password-manager autofill sets the field's value directly at
    // the DOM level — no native 'input' event fires, so neither React nor
    // the Places widget ever hear about it and suggestions never appear.
    // `:-webkit-autofill` + `animationstart` (see the <style> below) is the
    // standard way to detect that; once detected, dispatch a real 'input'
    // event so both our onChange and Places' own listener react to it.
    const handleAutofill = (e) => {
      if (e.animationName !== "onAutoFillStart") return;
      if (document.activeElement !== input) input.focus();
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    input.addEventListener("animationstart", handleAutofill);

    return () => {
      placeListener.remove();
      input.removeEventListener("animationstart", handleAutofill);
    };
  }, [googleLoaded]);

  // Any other way the address can end up changed without a native 'input'
  // event on the field itself — e.g. prefilled from the customer's saved
  // profile once it loads (see the hydration effect above) — leaves
  // `destination` unresolved and the customer stuck. Nudge Places the same
  // way autofill does whenever the value changes without having gone
  // through the field's own onChange first.
  useEffect(() => {
    if (!googleLoaded || form.address === typedAddressRef.current) return;
    typedAddressRef.current = form.address;
    if (!form.address) return;
    addressInputRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [form.address, googleLoaded]);

  // Fetches priced options for every enabled speed. Returns the new options,
  // or null if quoting failed (checkout is then blocked — no flat-fee fallback).
  const fetchDeliveryOptions = async () => {
    try {
      const { options } = await getDeliveryOptions({
        items: items.map((i) => ({ storefrontProductId: i.id, quantity: i.quantity })),
        destination: { lat: destination.lat, lng: destination.lng, address: form.address, state: form.state },
      }).unwrap();
      setDeliveryOptions(options);
      setQuotedAt(Date.now());
      setQuoteError("");
      if (options.length && !options.some((o) => o.serviceType === serviceType)) {
        setServiceType(options[0].serviceType);
      }
      return options;
    } catch (err) {
      setDeliveryOptions([]);
      setQuoteError(err?.data?.message ?? "Could not calculate delivery fee. Please try again.");
      return null;
    }
  };

  // Re-quote (debounced) whenever the resolved destination or cart contents
  // change. Switching speed doesn't re-quote — every speed is already priced.
  const itemsKey = items.map((i) => `${i.id}:${i.quantity}`).join(",");
  useEffect(() => {
    if (!destination) {
      setDeliveryOptions([]);
      setQuoteError("");
      return;
    }
    const t = setTimeout(fetchDeliveryOptions, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, itemsKey]);

  // Guest order lookups need the shipping email to prove ownership (see
  // getOrderByNumber); logged-in customers are matched by their account instead.
  const confirmationPath = (orderNumber) =>
    customer
      ? `/order-confirmation/${orderNumber}`
      : `/order-confirmation/${orderNumber}?email=${encodeURIComponent(form.email.trim())}`;

  const discountAmount = appliedPromo?.discount_amount ?? 0;
  const shippingFee = deliveryQuote?.total ?? 0;
  const total = Math.max(subtotal - discountAmount + shippingFee, 0);
  const walletCovers = walletBalance >= total;
  const canPlaceOrder =
    !!deliveryQuote && !isQuoting && (payment !== "wallet" || walletCovers);

  const paymentOptions = [
    {
      value: "paystack",
      label: "Pay with Card",
      desc: "Secure card payment via Paystack",
      icon: CreditCard,
    },
    ...(authCustomer
      ? [
          {
            value: "wallet",
            label: "Pay from Wallet",
            desc: `Balance: ₦${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: Wallet,
          },
        ]
      : []),
  ];

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
    if (!form.address.trim())  e.address  = "Required";
    if (!form.city.trim())     e.city     = "Required";
    if (!form.state.trim())    e.state    = "Required";
    if (!destination)          e.address  = e.address ?? "Select your address from the suggestions to calculate delivery";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    if (!deliveryQuote) {
      setServerError(quoteError || "Delivery fee is still being calculated. Please wait a moment and try again.");
      return;
    }
    setServerError("");
    // MDS quotes are valid for 30 minutes. The server always re-quotes when
    // placing the order, so refresh a stale quote first and stop if the price
    // moved — the customer should see what they'll be charged.
    if (Date.now() - quotedAt > QUOTE_TTL_MS) {
      const fresh = await fetchDeliveryOptions();
      const freshQuote = fresh?.find((o) => o.serviceType === serviceType);
      if (!freshQuote) return;
      if (freshQuote.total !== deliveryQuote.total) {
        setServerError(`Delivery fee updated to ₦${freshQuote.total.toLocaleString()}. Please review your total and place the order again.`);
        return;
      }
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
          lat:     destination?.lat,
          lng:     destination?.lng,
        },
        payment_method: payment,
        notes: form.notes.trim() || undefined,
        coupon_code: appliedPromo?.code || undefined,
        serviceType,
      };
      const res = await placeOrder(payload).unwrap();
      dispatch(clearCart());

      if (payment === "wallet") {
        try {
          await payOrderWithWallet({ order_number: res.order.order_number }).unwrap();
        } catch (err) {
          // Order exists but the debit failed (e.g. balance changed) — send
          // them to the confirmation page to retry from there.
          setServerError(err?.data?.message ?? "Wallet payment failed. You can complete it from the order page.");
          navigate(confirmationPath(res.order.order_number));
          return;
        }
        navigate(confirmationPath(res.order.order_number));
        return;
      }

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
            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-primary-500" />
                <h2 className="text-sm font-bold text-neutral-800">Shipping Information</h2>
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

              <Field label="Delivery Address" error={errors.address} required>
                {/* :-webkit-autofill + animationstart is how the effect above
                    detects browser/password-manager autofill on this field —
                    see the "handleAutofill" listener. */}
                <style>{`
                  @keyframes onAutoFillStart { from { opacity: 1; } to { opacity: 1; } }
                  .checkout-address-input:-webkit-autofill { animation-name: onAutoFillStart; }
                `}</style>
                <input
                  ref={addressInputRef}
                  value={form.address}
                  onChange={(e) => {
                    typedAddressRef.current = e.target.value;
                    set("address")(e);
                    setDestination(null);
                  }}
                  placeholder={googleLoaded ? "Start typing your address…" : "123 Street Name"}
                  className={`checkout-address-input ${inputCls(errors.address)}`}
                />
                {destination && (
                  <p className="mt-1 text-[11px] text-emerald-600">Address confirmed — delivery fee calculated below.</p>
                )}
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

              <Field label="Delivery Speed">
                {deliveryOptions.length === 0 ? (
                  <p className="rounded-xl border-2 border-dashed border-neutral-200 p-3 text-xs text-neutral-400">
                    {isQuoting
                      ? "Getting delivery prices…"
                      : quoteError
                      ? quoteError
                      : "Select your address from the suggestions to see delivery options."}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {deliveryOptions.map((option) => (
                      <label
                        key={option.serviceType}
                        className={`flex flex-col rounded-xl border-2 p-3 cursor-pointer transition-all ${
                          serviceType === option.serviceType ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2 text-sm font-semibold text-neutral-800">
                          <span className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="delivery_speed"
                              checked={serviceType === option.serviceType}
                              onChange={() => setServiceType(option.serviceType)}
                              className="accent-primary-600"
                            />
                            {SERVICE_LABELS[option.serviceType] ?? option.serviceType}
                          </span>
                          <span>₦{option.total.toLocaleString()}</span>
                        </span>
                        <span className="text-xs text-neutral-500 mt-0.5 ml-6">{formatEstimate(option.estimate)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </Field>

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

              {paymentOptions.map(({ value, label, desc, icon: Icon }) => (
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

              {payment === "wallet" && (
                <div className={`rounded-xl border p-4 text-sm ${
                  walletCovers
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  {walletCovers ? (
                    <p>
                      ₦{total.toLocaleString()} will be deducted from your wallet balance of
                      {" "}₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.
                    </p>
                  ) : (
                    <p>
                      Your wallet balance (₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                      doesn&apos;t cover this order.{" "}
                      <Link to="/account?tab=wallet" className="font-semibold underline">Add funds</Link>{" "}
                      or choose another payment method.
                    </p>
                  )}
                </div>
              )}

              {payment === "bank_transfer" && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-1.5">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Bank Details</p>
                  <p className="text-sm text-amber-900"><span className="font-semibold">Account Name:</span> {BANK.name}</p>
                  <p className="text-sm text-amber-900"><span className="font-semibold">Account Number:</span> {BANK.account}</p>
                  <p className="text-sm text-amber-900"><span className="font-semibold">Bank:</span> {BANK.bank}</p>
                  <p className="text-xs text-amber-700 mt-2">
                    Transfer ₦{total.toLocaleString()} and use your order number as reference.
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
                      <p className="text-xs text-neutral-500 mt-0.5">Qty: {item.quantity}</p>
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
                <div className="flex justify-between text-neutral-600">
                  <span>
                    Delivery
                    {deliveryQuote ? ` (${SERVICE_LABELS[deliveryQuote.serviceType] ?? deliveryQuote.serviceType})` : ""}
                  </span>
                  {isQuoting ? (
                    <span className="text-neutral-400">Calculating…</span>
                  ) : deliveryQuote ? (
                    <span>₦{shippingFee.toLocaleString()}</span>
                  ) : quoteError ? (
                    <span className="text-red-500">Unavailable</span>
                  ) : (
                    <span className="text-neutral-400">Select address</span>
                  )}
                </div>
                {quoteError && !isQuoting && (
                  <p className="text-xs text-red-500">{quoteError}</p>
                )}
                {deliveryQuote && (
                  <div className="pl-3 space-y-1 text-[11px] text-neutral-400">
                    {deliveryQuote.distanceKm != null && (
                      <div className="flex justify-between">
                        <span>Distance</span>
                        <span>{Number(deliveryQuote.distanceKm).toFixed(1)} km</span>
                      </div>
                    )}
                    {deliveryQuote.weightKg != null && (
                      <div className="flex justify-between">
                        <span>Package weight</span>
                        <span>{deliveryQuote.weightKg} kg</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Estimated delivery</span>
                      <span>{formatEstimate(deliveryQuote.estimate)}</span>
                    </div>
                    <p>
                      Includes VAT{deliveryQuote.insuranceIncluded ? " and goods-in-transit insurance" : ""}.
                    </p>
                  </div>
                )}
                <div className="flex justify-between font-bold text-neutral-800 text-base pt-1 border-t border-neutral-100">
                  <span>Total</span>
                  <span className="text-secondary-700">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || initializingPayment || payingWithWallet || !canPlaceOrder}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {isLoading || initializingPayment || payingWithWallet ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Lock size={14} />
                )}
                {isLoading
                  ? "Placing Order…"
                  : payingWithWallet
                  ? "Paying from wallet…"
                  : initializingPayment
                  ? "Redirecting to Paystack…"
                  : !destination
                  ? "Select delivery address to continue"
                  : isQuoting
                  ? "Calculating delivery…"
                  : !deliveryQuote
                  ? "Delivery unavailable"
                  : payment === "wallet" && !walletCovers
                  ? "Insufficient wallet balance"
                  : payment === "wallet"
                  ? "Pay & Place Order"
                  : "Place Order"}
              </button>

              <p className="mt-3 text-[10px] text-neutral-400 text-center">
                By placing this order you agree to our Terms &amp; Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
