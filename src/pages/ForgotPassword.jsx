import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, ArrowLeft, CheckCircle } from "lucide-react";
import { useForgotPasswordMutation } from "../api/storefrontApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState(null); // { resetToken }

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!email.trim()) { setEmailError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError("Enter a valid email"); return; }
    setEmailError("");
    setServerError("");
    try {
      const res = await forgotPassword({ email }).unwrap();
      setResult(res);
    } catch (err) {
      setServerError(err?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  if (result) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-green-500" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-800">Check your inbox</h2>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
            If an account exists for <span className="font-semibold text-neutral-700">{email}</span>,
            reset instructions have been sent.
          </p>

          {/* Dev helper — remove in production when email is configured */}
          {result.resetToken && (
            <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-left">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">
                Development mode — no email configured
              </p>
              <p className="text-xs text-amber-700 mb-3">
                In production this link would be emailed. Click below to reset:
              </p>
              <button
                onClick={() => navigate(`/reset-password?token=${result.resetToken}`)}
                className="w-full rounded-lg bg-amber-500 py-2 text-xs font-bold text-white hover:bg-amber-600 transition-colors"
              >
                Open reset link →
              </button>
            </div>
          )}

          <Link
            to="/sign-in"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline font-medium"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
        <div className="mb-7 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <KeyRound size={22} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-800">Reset password</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Enter your email and we&apos;ll send reset instructions
          </p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none transition-all bg-white focus:ring-2 focus:ring-primary-50 ${
                  emailError ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-primary-400"
                }`}
              />
            </div>
            {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            {isLoading && (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            {isLoading ? "Sending…" : "Send Reset Instructions"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={13} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
