import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../api/storefrontApi";
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

export default function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setServerError("");
    try {
      const res = await login({ email: form.email, password: form.password }).unwrap();
      dispatch(setCredentials({ customer: res.customer, token: res.token }));
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  const inputCls = (err) =>
    `w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none transition-all bg-white focus:ring-2 focus:ring-primary-50 ${
      err ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-primary-400"
    }`;

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
        {/* Heading */}
        <div className="mb-7 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <LogIn size={22} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Welcome back</h1>
          <p className="text-sm text-neutral-400 mt-1">Sign in to your SammyTech account</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Your password"
                className={inputCls(errors.password) + " pr-10"}
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

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-primary-600 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-sm mt-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <LogIn size={15} />
            )}
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link to="/sign-up" className="text-primary-600 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
