import { useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Smartphone, BatteryCharging, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import {
  useGetSwapModelsQuery,
  useGetSwapTargetProductsQuery,
  useGetSwapOptionsQuery,
  useGetSwapQuoteMutation,
} from "../api/storefrontApi";

const selectCls =
  "mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50";
const labelCls = "text-xs font-semibold text-neutral-500";

function modelLabel(m) {
  return `${m.brand} ${m.model_name}${m.storage_gb ? ` ${m.storage_gb}GB` : ""}`;
}

function formatNaira(n) {
  return `₦${Number(n).toLocaleString()}`;
}

export default function PhoneSwap() {
  const { data: modelsData, isLoading: modelsLoading } = useGetSwapModelsQuery();
  const { data: targetProductsData, isLoading: targetsLoading } = useGetSwapTargetProductsQuery();
  const { data: optionsData, isLoading: optionsLoading } = useGetSwapOptionsQuery();
  const [getSwapQuote, { isLoading: quoting }] = useGetSwapQuoteMutation();

  const models = modelsData ?? [];
  const targetProducts = targetProductsData ?? [];
  const batteryTiers = optionsData?.batteryTiers ?? [];
  const neatnessTiers = optionsData?.neatnessTiers ?? [];
  const issues = optionsData?.issues ?? [];

  const [fromModelId, setFromModelId] = useState("");
  const [toProductId, setToProductId] = useState("");
  const [batteryTier, setBatteryTier] = useState("");
  const [neatnessTier, setNeatnessTier] = useState("");
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleIssue = (key) =>
    setSelectedIssues((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const canSubmit = fromModelId && batteryTier && neatnessTier;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);
    if (!canSubmit) return;

    try {
      const quote = await getSwapQuote({
        fromModelId: Number(fromModelId),
        toProductId: toProductId ? Number(toProductId) : undefined,
        batteryTier,
        neatnessTier,
        issues: selectedIssues,
      }).unwrap();
      setResult(quote);
    } catch (err) {
      setErrorMsg(err?.data?.message || "We couldn't generate a quote for that combination. Please try again.");
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="mx-auto max-w-4xl px-4 py-14 flex flex-col items-center text-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
            <RefreshCw size={12} /> Trade-In Program
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Want to Swap Your Phone?</h1>
          <p className="text-primary-100 max-w-lg">
            Tell us what you have and its condition — we'll give you an instant estimated trade-in value.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-8 space-y-6 shadow-sm">
          {/* Phones */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-primary-50 flex items-center justify-center">
                <Smartphone size={16} className="text-primary-600" />
              </div>
              <h2 className="font-bold text-neutral-800">Choose your phones</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone you have</label>
                <select className={selectCls} value={fromModelId} onChange={(e) => setFromModelId(e.target.value)} disabled={modelsLoading}>
                  <option value="">Select your current phone</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {modelLabel(m)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Phone you want to swap to (optional)</label>
                <select className={selectCls} value={toProductId} onChange={(e) => setToProductId(e.target.value)} disabled={targetsLoading}>
                  <option value="">Select the phone you want</option>
                  {targetProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.display_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Condition */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-primary-50 flex items-center justify-center">
                <BatteryCharging size={16} className="text-primary-600" />
              </div>
              <h2 className="font-bold text-neutral-800">Current phone condition</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Battery health</label>
                <select className={selectCls} value={batteryTier} onChange={(e) => setBatteryTier(e.target.value)} disabled={optionsLoading}>
                  <option value="">Select battery health</option>
                  {batteryTiers.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Neatness</label>
                <select className={selectCls} value={neatnessTier} onChange={(e) => setNeatnessTier(e.target.value)} disabled={optionsLoading}>
                  <option value="">Select neatness</option>
                  {neatnessTiers.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Issues */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-primary-50 flex items-center justify-center">
                <Sparkles size={16} className="text-primary-600" />
              </div>
              <h2 className="font-bold text-neutral-800">Does your phone have any of these?</h2>
            </div>
            <p className="text-xs text-neutral-400 mb-3">Select all that apply — this may affect the final value.</p>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {issues.map((issue) => {
                const checked = selectedIssues.includes(issue.key);
                return (
                  <label
                    key={issue.key}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                      checked ? "border-primary-400 bg-primary-50 text-primary-700" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleIssue(issue.key)} />
                    {checked ? <CheckCircle2 size={16} className="text-primary-600 shrink-0" /> : <span className="h-4 w-4 rounded border border-neutral-300 shrink-0" />}
                    {issue.label}
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || quoting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {quoting ? "Calculating…" : "Get Swap Value"} <ArrowRight size={16} />
          </button>
        </form>

        {/* Result */}
        {errorMsg && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
            <p className="text-sm font-medium text-amber-800">{errorMsg}</p>
            <Link to="/contact" className="text-sm font-semibold text-primary-600 hover:underline">
              Contact us for a manual quote →
            </Link>
          </div>
        )}

        {result && (
          <div className="rounded-2xl border border-primary-200 bg-primary-50/50 p-6 sm:p-8 text-center space-y-5">
          

            {result.toProduct && (
              <div className="border-t border-primary-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-500">
                  Estimated top-up for {result.toProduct.display_name}
                </p>
                <p className="mt-1 text-xl font-bold text-neutral-800">
                  {result.topUpRange.max <= 0
                    ? "No top-up needed"
                    : `${formatNaira(Math.max(0, result.topUpRange.min))} - ${formatNaira(Math.max(0, result.topUpRange.max))}`}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Market value {formatNaira(result.toProduct.regular_price)} minus your trade-in value
                </p>
              </div>
            )}

            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              This is an estimate — final value is confirmed after a quick physical inspection.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
            >
              Book your swap <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
