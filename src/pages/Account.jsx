import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  ShoppingBag,
  MapPin,
  Lock,
  ChevronRight,
  Package,
  LogOut,
  Check,
  AlertCircle,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  Gift,
  Copy,
  Users,
} from "lucide-react";
import {
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetMyOrdersQuery,
  useGetReferralSummaryQuery,
} from "../api/storefrontApi";
import { selectCurrentCustomer, logout } from "../store/authSlice";
import { NIGERIA_STATES } from "../constants/nigeriaStates";

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "bg-amber-100 text-amber-700",   icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700",     icon: RotateCcw },
  shipped:    { label: "Shipped",    color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered:  { label: "Delivered",  color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-700",       icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function initials(first, last) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

// ── Feedback banner ────────────────────────────────────────────────────────────

function Feedback({ type, msg, onClose }) {
  if (!msg) return null;
  const isError = type === "error";
  return (
    <div className={`flex items-start gap-2 rounded-xl p-3 text-sm mb-4 ${isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
      {isError ? <AlertCircle size={15} className="mt-0.5 shrink-0" /> : <Check size={15} className="mt-0.5 shrink-0" />}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────

function OverviewTab({ customer, orders }) {
  const recentOrders = (orders ?? []).slice(0, 3);
  const totalOrders = orders?.length ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending" || o.status === "processing").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="flex items-center gap-4 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl p-5 text-white">
        <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
          {initials(customer?.first_name, customer?.last_name)}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-lg leading-tight truncate">
            {customer?.first_name} {customer?.last_name}
          </p>
          <p className="text-primary-100 text-sm truncate">{customer?.email}</p>
          {customer?.createdAt && (
            <p className="text-primary-200 text-xs mt-0.5">
              Member since {formatDate(customer.createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 text-center">
          <p className="text-2xl font-bold text-neutral-800">{totalOrders}</p>
          <p className="text-xs text-neutral-400 mt-0.5 font-medium">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingOrders}</p>
          <p className="text-xs text-neutral-400 mt-0.5 font-medium">Active Orders</p>
        </div>
      </div>

      {/* Recent orders preview */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <p className="text-sm font-semibold text-neutral-700">Recent Orders</p>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/order-confirmation/${order.order_number}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-800 font-mono">{order.order_number}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <p className="text-sm font-bold text-neutral-700">₦{Number(order.total).toLocaleString()}</p>
                  <ChevronRight size={13} className="text-neutral-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Orders ───────────────────────────────────────────────────────────────

function OrdersTab({ orders, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-neutral-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 py-16 text-center">
        <div className="h-14 w-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag size={24} className="text-primary-300" />
        </div>
        <p className="text-neutral-500 font-medium">No orders yet</p>
        <p className="text-sm text-neutral-400 mt-1">Your order history will appear here.</p>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-neutral-100 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
        <span>Order</span>
        <span>Date</span>
        <span>Items</span>
        <span>Status</span>
        <span>Total</span>
      </div>
      <div className="divide-y divide-neutral-100">
        {orders.map((order) => {
          const itemCount = order.StorefrontOrderItems?.length ?? 0;
          return (
            <Link
              key={order.id}
              to={`/order-confirmation/${order.order_number}`}
              className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center gap-2 sm:gap-4 px-4 py-4 hover:bg-neutral-50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Package size={15} className="text-primary-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-800 font-mono truncate">
                    {order.order_number}
                  </p>
                  <p className="text-[10px] text-neutral-400 sm:hidden">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <p className="hidden sm:block text-xs text-neutral-500 whitespace-nowrap">{formatDate(order.createdAt)}</p>
              <p className="hidden sm:block text-xs text-neutral-500 text-center">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </p>
              <StatusBadge status={order.status} />
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <p className="text-sm font-bold text-neutral-700">₦{Number(order.total).toLocaleString()}</p>
                <ChevronRight size={13} className="text-neutral-300 group-hover:text-primary-500 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Profile ──────────────────────────────────────────────────────────────

function ProfileTab({ customer }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", phone_number: "",
  });
  const [feedback, setFeedback] = useState(null);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    if (customer) {
      setForm({
        first_name: customer.first_name ?? "",
        last_name: customer.last_name ?? "",
        phone_number: customer.phone_number ?? "",
      });
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await updateProfile(form).unwrap();
      setFeedback({ type: "success", msg: "Profile updated successfully." });
    } catch (err) {
      setFeedback({ type: "error", msg: err?.data?.message ?? "Failed to update profile." });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h3 className="text-sm font-bold text-neutral-800 mb-4">Personal Information</h3>
      <Feedback {...(feedback ?? {})} msg={feedback?.msg} onClose={() => setFeedback(null)} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "First Name", key: "first_name", required: true },
            { label: "Last Name",  key: "last_name",  required: true },
          ].map(({ label, key, required }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                required={required}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">Email Address</label>
          <input
            value={customer?.email ?? ""}
            disabled
            className="w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-400 cursor-not-allowed"
          />
          <p className="text-[10px] text-neutral-400 mt-1">Email cannot be changed.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">Phone Number</label>
          <input
            value={form.phone_number}
            onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
            placeholder="e.g. 08012345678"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

// ── Tab: Address ──────────────────────────────────────────────────────────────

function AddressTab({ customer }) {
  const [form, setForm] = useState({ address: "", city: "", state: "" });
  const [feedback, setFeedback] = useState(null);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    if (customer) {
      setForm({
        address: customer.address ?? "",
        city: customer.city ?? "",
        state: customer.state ?? "",
      });
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await updateProfile({
        first_name: customer?.first_name,
        last_name: customer?.last_name,
        phone_number: customer?.phone_number,
        ...form,
      }).unwrap();
      setFeedback({ type: "success", msg: "Address saved. It will pre-fill on checkout." });
    } catch (err) {
      setFeedback({ type: "error", msg: err?.data?.message ?? "Failed to save address." });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h3 className="text-sm font-bold text-neutral-800 mb-1">Default Shipping Address</h3>
      <p className="text-xs text-neutral-400 mb-4">This address will pre-fill when you checkout.</p>
      <Feedback {...(feedback ?? {})} msg={feedback?.msg} onClose={() => setFeedback(null)} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">Street Address</label>
          <input
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="e.g. 12 Allen Avenue, Ikeja"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">City / Town</label>
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Lagos"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">State</label>
            <select
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition bg-white"
            >
              <option value="">Select state…</option>
              {NIGERIA_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving…" : "Save Address"}
        </button>
      </form>
    </div>
  );
}

// ── Tab: Security ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [feedback, setFeedback] = useState(null);
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (form.new_password !== form.confirm_password) {
      return setFeedback({ type: "error", msg: "New passwords do not match." });
    }
    if (form.new_password.length < 6) {
      return setFeedback({ type: "error", msg: "New password must be at least 6 characters." });
    }
    try {
      const res = await updatePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      }).unwrap();
      setFeedback({ type: "success", msg: res.message ?? "Password updated successfully." });
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setFeedback({ type: "error", msg: err?.data?.message ?? "Failed to update password." });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h3 className="text-sm font-bold text-neutral-800 mb-4">Change Password</h3>
      <Feedback {...(feedback ?? {})} msg={feedback?.msg} onClose={() => setFeedback(null)} />
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        {[
          { label: "Current Password", key: "current_password" },
          { label: "New Password",     key: "new_password" },
          { label: "Confirm New Password", key: "confirm_password" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">{label}</label>
            <input
              type="password"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              required
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}

// ── Tab: Referrals ─────────────────────────────────────────────────────────────

function ReferralsTab() {
  const { data, isLoading } = useGetReferralSummaryQuery();
  const [copied, setCopied] = useState(false);

  const referralLink = data?.referral_code
    ? `${window.location.origin}/sign-up?ref=${data.referral_code}`
    : "";

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (e.g. insecure context) — nothing to recover here.
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-neutral-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const availableCount =
    data?.reward_codes?.filter((c) => c.active && c.used_count < c.max_uses).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Referral link card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Gift size={16} />
          <p className="font-bold text-sm">Refer a friend, earn 5%</p>
        </div>
        <p className="text-primary-100 text-xs leading-relaxed">
          Share your link. When someone you referred spends over ₦50,000, you get a 5% discount code.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5">
          <span className="flex-1 text-sm font-mono font-semibold truncate">{referralLink}</span>
          <button
            onClick={copyLink}
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-2.5 py-1.5 text-xs font-semibold transition-colors"
          >
            <Copy size={12} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 text-center">
          <p className="text-2xl font-bold text-neutral-800">{data?.referrals?.length ?? 0}</p>
          <p className="text-xs text-neutral-400 mt-0.5 font-medium">Friends Referred</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{availableCount}</p>
          <p className="text-xs text-neutral-400 mt-0.5 font-medium">Rewards Available</p>
        </div>
      </div>

      {/* Reward codes */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <p className="text-sm font-semibold text-neutral-700">Your Reward Codes</p>
        </div>
        {!data?.reward_codes?.length ? (
          <div className="py-10 text-center">
            <Gift size={22} className="text-neutral-200 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No rewards earned yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {data.reward_codes.map((c) => {
              const redeemed = c.used_count >= c.max_uses;
              return (
                <div key={c.code} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-bold font-mono text-neutral-800">{c.code}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {c.value}% off
                      {c.expires_at && ` · expires ${formatDate(c.expires_at)}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                      redeemed ? "bg-neutral-100 text-neutral-400" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {redeemed ? "Redeemed" : "Available"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Referred friends */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100">
          <p className="text-sm font-semibold text-neutral-700">Friends You've Referred</p>
        </div>
        {!data?.referrals?.length ? (
          <div className="py-10 text-center">
            <Users size={22} className="text-neutral-200 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No referrals yet — share your link above.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {data.referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-medium text-neutral-700">{r.first_name} {r.last_name}</p>
                <p className="text-xs text-neutral-400">Joined {formatDate(r.joined_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",  label: "Overview",  icon: User },
  { id: "orders",    label: "My Orders", icon: ShoppingBag },
  { id: "referrals", label: "Referrals", icon: Gift },
  { id: "profile",   label: "Profile",   icon: User },
  { id: "address",   label: "Address",   icon: MapPin },
  { id: "security",  label: "Security",  icon: Lock },
];

export default function Account() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authCustomer = useSelector(selectCurrentCustomer);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: customer } = useGetMeQuery(undefined, { skip: !authCustomer });
  const { data: ordersData, isLoading: ordersLoading } = useGetMyOrdersQuery(undefined, {
    skip: !authCustomer,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authCustomer) navigate("/sign-in", { replace: true });
  }, [authCustomer, navigate]);

  if (!authCustomer) return null;

  const orders = ordersData?.orders ?? [];

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-neutral-400 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight size={11} />
        <span className="text-neutral-600">My Account</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            {/* Avatar header */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-500 px-4 py-4 text-white">
              <div className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center font-bold text-sm mb-2">
                {initials(customer?.first_name ?? authCustomer.first_name, customer?.last_name ?? authCustomer.last_name)}
              </div>
              <p className="text-sm font-semibold leading-tight truncate">
                {customer?.first_name ?? authCustomer.first_name} {customer?.last_name ?? authCustomer.last_name}
              </p>
              <p className="text-[11px] text-primary-200 truncate">{authCustomer.email}</p>
            </div>

            {/* Nav items */}
            <nav className="p-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    activeTab === id
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
              <div className="border-t border-neutral-100 mt-2 pt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {activeTab === "overview" && (
            <OverviewTab customer={customer ?? authCustomer} orders={orders} />
          )}
          {activeTab === "orders" && (
            <OrdersTab orders={orders} isLoading={ordersLoading} />
          )}
          {activeTab === "referrals" && <ReferralsTab />}
          {activeTab === "profile" && (
            <ProfileTab customer={customer ?? authCustomer} />
          )}
          {activeTab === "address" && (
            <AddressTab customer={customer ?? authCustomer} />
          )}
          {activeTab === "security" && <SecurityTab />}
        </main>
      </div>
    </div>
  );
}
