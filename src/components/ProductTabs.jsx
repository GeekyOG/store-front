import { useState } from "react";
import DOMPurify from "dompurify";
import { Clock, Package, AlertCircle } from "lucide-react";

const TABS = [
  { id: "description", label: "Description" },
  { id: "specs", label: "Specs" },
  { id: "warranty", label: "Warranty" },
];

// Quill's toolbar in the admin only enables header/bold/italic/underline/
// strike/list/link, so the saved HTML is plain semantic tags — quill.core.css
// (imported globally) handles list bullets via its counter/pseudo-element
// system; these overrides just restore paragraph/heading spacing that
// quill.core.css intentionally zeroes out inside the editor itself.
const DESCRIPTION_CLASS =
  "ql-editor !p-0 !overflow-visible text-sm text-neutral-600 " +
  "[&_p]:mb-3 [&_p:last-child]:mb-0 " +
  "[&_h1]:mb-3 [&_h1]:mt-1 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-neutral-800 " +
  "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-800 " +
  "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-neutral-800 " +
  "[&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1 " +
  "[&_strong]:font-semibold [&_strong]:text-neutral-800 " +
  "[&_a]:text-primary-600 [&_a]:underline";

function SpecsTable({ specs }) {
  const rows = [];
  for (let i = 0; i < specs.length; i += 2) rows.push([specs[i], specs[i + 1]]);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 divide-y divide-neutral-200">
      {rows.map((pair, rowIdx) => (
        <div
          key={rowIdx}
          className={`grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 ${
            rowIdx % 2 === 1 ? "bg-neutral-50" : "bg-white"
          }`}
        >
          {pair.map((spec, i) =>
            spec ? (
              <div key={i} className="grid grid-cols-2 gap-2 px-4 py-3 text-sm">
                <span className="text-neutral-500">{spec.label}</span>
                <span className="font-medium text-neutral-800">{spec.value}</span>
              </div>
            ) : (
              <div key={i} />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

function WarrantyPanel() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-neutral-600">
      <p>
        Every order is covered. If a product develops a fault under normal
        use within its warranty period, contact us for a repair, replacement,
        or refund at our discretion.
      </p>

      <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-3">
        {[
          { Icon: Clock, label: "14 Days — UK-Used Phones" },
          { Icon: Package, label: "30 Days — Brand New Phones" },
          { Icon: AlertCircle, label: "Excludes Liquid & Screen Damage" },
        ].map(({ Icon, label }) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5 px-1 text-center">
            <Icon size={18} className="text-emerald-600" />
            <span className="text-[11px] font-medium leading-tight text-neutral-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductTabs({ product }) {
  const [tab, setTab] = useState("description");

  const description = product?.full_description ?? "";
  const specs = Array.isArray(product?.specifications) ? product.specifications : [];

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex overflow-x-auto border-b border-neutral-200 px-2 no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6">
        {tab === "description" &&
          (description ? (
            <div
              className={DESCRIPTION_CLASS}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
            />
          ) : (
            <p className="text-sm text-neutral-400">No description available for this product.</p>
          ))}

        {tab === "specs" &&
          (specs.length > 0 ? (
            <SpecsTable specs={specs} />
          ) : (
            <p className="text-sm text-neutral-400">No specifications available for this product.</p>
          ))}

        {tab === "warranty" && <WarrantyPanel />}
      </div>
    </div>
  );
}
