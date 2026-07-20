import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus, Gift, PartyPopper, Tag } from "lucide-react";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../api/storefrontApi";
import { setCredentials } from "../store/authSlice";

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    phone_number: "", password: "", confirm: "",
    referral_code: searchParams.get("ref") ?? "",
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [welcomeCode, setWelcomeCode] = useState(null);
  const [myReferralCode, setMyReferralCode] = useState(null);

  const [register, { isLoading }] = useRegisterMutation();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setServerError("");
    try {
      const { confirm, ...body } = form;
      const res = await register(body).unwrap();
      dispatch(setCredentials({ customer: res.customer, token: res.token }));
      if (res.discountCode) {
        setMyReferralCode(res.customer?.referral_code ?? null);
        setWelcomeCode(res.discountCode);
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setServerError(err?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  const inputCls = (err, extra = "") =>
    `w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none transition-all bg-white focus:ring-2 focus:ring-primary-50 ${extra} ${
      err ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-primary-400"
    }`;

  if (welcomeCode) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <PartyPopper size={26} className="text-primary-600" />
          </div>
          <h1 className="text-xl font-extrabold text-neutral-800">Account created!</h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            Here's your ₦5,000 off welcome code — we've also emailed it to you.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50 px-4 py-3">
            <Gift size={16} className="text-primary-600 shrink-0" />
            <span className="text-lg font-extrabold tracking-wide text-primary-700">{welcomeCode}</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">Valid for one order on your account.</p>

          {myReferralCode && (
            <p className="text-xs text-neutral-500 mt-4">
              Your referral code is <span className="font-bold text-neutral-700">{myReferralCode}</span> — share
              it and earn ₦5,000 when a friend spends over ₦50,000 on their first order.{" "}
              <Link to="/account" className="text-primary-600 font-semibold hover:underline">
                View in Account
              </Link>
            </p>
          )}

          <button
            onClick={() => navigate("/", { replace: true })}
            className="w-full mt-6 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
        <div className="mb-7 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <UserPlus size={22} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Create account</h1>
          <p className="text-sm text-neutral-400 mt-1">Join SammyTech and start shopping</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" error={errors.first_name}>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  value={form.first_name}
                  onChange={set("first_name")}
                  placeholder="John"
                  className={inputCls(errors.first_name)}
                />
              </div>
            </Field>
            <Field label="Last Name" error={errors.last_name}>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  value={form.last_name}
                  onChange={set("last_name")}
                  placeholder="Doe"
                  className={inputCls(errors.last_name)}
                />
              </div>
            </Field>
          </div>

          <Field label="Email Address" error={errors.email}>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className={inputCls(errors.email)}
              />
            </div>
          </Field>

          <Field label="Phone Number (optional)" error={errors.phone_number}>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="tel"
                value={form.phone_number}
                onChange={set("phone_number")}
                placeholder="+234 800 000 0000"
                className={inputCls(errors.phone_number)}
              />
            </div>
          </Field>

          <Field label="Referral Code (optional)" error={errors.referral_code}>
            <div className="relative">
              <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                value={form.referral_code}
                onChange={set("referral_code")}
                placeholder="e.g. REF-AB12CD"
                className={inputCls(errors.referral_code, "uppercase placeholder:normal-case")}
              />
            </div>
          </Field>

          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 6 characters"
                className={inputCls(errors.password, "pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          <Field label="Confirm Password" error={errors.confirm}>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="Repeat your password"
                className={inputCls(errors.confirm)}
              />
            </div>
          </Field>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-sm mt-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <UserPlus size={15} />
            )}
            {isLoading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
