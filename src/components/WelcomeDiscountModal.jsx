import { useNavigate } from "react-router-dom";
import { Gift, X } from "lucide-react";

export default function WelcomeDiscountModal({ onClose }) {
  const navigate = useNavigate();

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

        <div className="px-7 pt-9 pb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
            <Gift size={26} className="text-primary-600" />
          </div>

          <h2 className="text-lg font-extrabold text-neutral-800">
            Get 5% off your first order
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            Create a free account and we'll email you a one-time discount code.
          </p>

          <button
            onClick={handleCreateAccount}
            className="mt-6 w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow-sm"
          >
            Create Account
          </button>
          <button
            onClick={onClose}
            className="mt-2.5 w-full py-2 text-xs font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
