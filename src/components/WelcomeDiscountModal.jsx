import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, X, Clock, Tag, ShieldCheck, Mail, Sparkle, Sparkles, Zap } from "lucide-react";

const EXPIRY_KEY = "sf_welcome_offer_expires";
const OFFER_DURATION_MS = 24 * 60 * 60 * 1000;

// Persists a real expiry timestamp so the countdown is honest across reloads
// (doesn't just reset to 24:00:00 every time the modal remounts) but still
// gives every visitor a fresh 24h window the first time they see it.
function getExpiry() {
  const stored = Number(localStorage.getItem(EXPIRY_KEY));
  const now = Date.now();
  if (stored > now) return stored;
  const expiry = now + OFFER_DURATION_MS;
  localStorage.setItem(EXPIRY_KEY, String(expiry));
  return expiry;
}

function useCountdown() {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, getExpiry() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setRemainingMs(Math.max(0, getExpiry() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    hours: pad(Math.floor(totalSeconds / 3600)),
    minutes: pad(Math.floor((totalSeconds % 3600) / 60)),
    seconds: pad(totalSeconds % 60),
  };
}

const TRUST_ITEMS = [
  { icon: Tag, label: "Exclusive Discounts" },
  { icon: ShieldCheck, label: "100% Secure & Safe" },
  { icon: Mail, label: "No Spam. We Promise." },
];

export default function WelcomeDiscountModal({ onClose }) {
  const navigate = useNavigate();
  const { hours, minutes, seconds } = useCountdown();

  const handleCreateAccount = () => {
    onClose();
    navigate("/sign-up");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1 text-neutral-800 hover:bg-neutral-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="px-6 pt-9 pb-7 text-center">
          {/* Gift icon with decorative confetti */}
          <div className="relative mx-auto mb-5 h-24 w-24">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
              <Gift size={40} className="text-primary-600" strokeWidth={2} />
            </div>
            <Zap size={16} className="absolute -top-1 left-2 rotate-12 fill-orange-400 text-orange-400" />
            <Sparkle size={13} className="absolute top-3 -right-2.5 fill-primary-500 text-primary-500" />
            <Sparkles size={15} className="absolute -bottom-1 right-3 fill-amber-400 text-amber-400" />
            <span className="absolute -bottom-1 -left-3 rotate-[-15deg] text-xl font-extrabold text-primary-500">
              ¢
            </span>
            <span className="absolute top-1 -left-4 rotate-[-10deg] text-lg font-extrabold text-primary-400">
              €
            </span>
          </div>

          {/* Limited time badge */}
          <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-4 py-1.5">
            <Clock size={13} className="text-primary-600" />
            <span className="text-xs font-bold uppercase tracking-wide text-primary-600">
              Limited Time Offer!
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-[26px] font-extrabold leading-tight text-neutral-900">
            Get <span className="text-primary-600">₦10,000</span> OFF
            <br />
            Your First Order! 🎉
          </h2>

          <p className="mt-3 text-sm text-neutral-500">
            Create a free account and we'll email you a one-time discount code.
          </p>

          {/* Trust badges */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-neutral-100">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 px-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                  <Icon size={17} className="text-primary-600" />
                </div>
                <p className="text-[11px] font-semibold leading-tight text-neutral-700">{label}</p>
              </div>
            ))}
          </div>

          {/* Countdown */}
          <div className="mt-5 flex items-center justify-between gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3.5 py-3">
            <div className="flex items-center gap-1.5 text-left text-xs font-semibold text-neutral-600">
              <Clock size={14} className="shrink-0 text-neutral-500" />
              <span>Hurry! This offer expires in:</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                ["HRS", hours],
                ["MINS", minutes],
                ["SECS", seconds],
              ].map(([label, value], i) => (
                <div key={label} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-lg font-extrabold text-primary-600">:</span>}
                  <div className="text-center leading-none">
                    <p className="text-lg font-extrabold tabular-nums text-primary-600">{value}</p>
                    <p className="mt-0.5 text-[9px] font-semibold text-neutral-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleCreateAccount}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <Gift size={17} />
            Claim My ₦10,000 Discount
          </button>
          <button
            onClick={onClose}
            className="mt-3 text-xs font-medium text-neutral-400 underline underline-offset-2 transition-colors hover:text-neutral-600"
          >
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
}
