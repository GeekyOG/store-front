import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useResetPasswordMutation } from "../api/storefrontApi";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
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
      await resetPassword({ token, password: form.password }).unwrap();
      setSuccess(true);
    } catch (err) {
      setServerError(err?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-800">Invalid link</h2>
          <p className="text-sm text-neutral-500 mt-2">This reset link is invalid or missing a token.</p>
          <Link
            to="/forgot-password"
            className="mt-5 inline-block rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-green-500" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-800">Password reset!</h2>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate("/sign-in", { replace: true })}
            className="mt-6 w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const inputCls = (err) =>
    `w-full rounded-xl border pl-10 pr-10 py-2.5 text-sm outline-none transition-all bg-white focus:ring-2 focus:ring-primary-50 ${
      err ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-primary-400"
    }`;

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
        <div className="mb-7 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <Lock size={22} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-800">New password</h1>
          <p className="text-sm text-neutral-400 mt-1">Choose a strong password for your account</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {serverError}{" "}
            {serverError.toLowerCase().includes("expired") && (
              <Link to="/forgot-password" className="underline font-medium">
                Request a new link
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 6 characters"
                className={inputCls(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              Confirm Password
            </label>
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
            {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-sm mt-2"
          >
            {isLoading && (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            {isLoading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
