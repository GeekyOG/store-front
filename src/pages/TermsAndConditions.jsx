import { Link } from "react-router-dom";
import { FileText, ChevronRight, ShieldAlert } from "lucide-react";

const LAST_UPDATED = "July 10, 2026";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: [
      `These Terms & Conditions govern your use of the SammyTech website and your purchase of any products from us. By accessing our site or placing an order, you agree to be bound by these terms. If you do not agree, please do not use our services.`,
    ],
  },
  {
    title: "2. Products & Pricing",
    body: [
      `We make every effort to display accurate product descriptions, images, and prices. However, errors may occasionally occur. If we discover a pricing or listing error after you've placed an order, we will contact you before proceeding, and you may choose to cancel.`,
    ],
  },
  {
    title: "3. Orders & Payment",
    list: [
      "An order is confirmed once payment is received or, for pay-on-delivery orders, once we accept your order.",
      "We reserve the right to refuse or cancel any order due to stock unavailability, suspected fraud, or pricing errors.",
      "Prices are listed in Nigerian Naira (₦) and are inclusive of applicable taxes unless stated otherwise.",
    ],
  },
  {
    title: "4. Delivery Policy",
    body: [
      `We deliver nationwide across Nigeria through trusted courier and dispatch rider partners.`,
    ],
    list: [
      "Delivery timelines: within Delta State, orders typically arrive within 24 hours. Everywhere else in Nigeria, delivery takes 24–72 hours depending on your location.",
      "Delivery coverage: we ship to every state in Nigeria. Remote areas may take slightly longer than the estimates above.",
      "Delivery charges: your shipping fee is calculated automatically based on the delivery state you select at checkout and is shown in full before you pay — no hidden charges.",
      "Delivery timeframes are estimates, not guarantees. SammyTech is not liable for delays caused by circumstances beyond our reasonable control, including courier delays or incorrect delivery information provided by the customer.",
    ],
  },
  {
    title: "5. Returns & Warranty Policy",
    body: [
      `We want you to be confident in every purchase. If a product develops a fault under normal use within the applicable warranty period below, contact us for a repair, replacement, or refund at our discretion.`,
    ],
    highlight: {
      heading: "WARRANTY POLICY",
      lines: [
        "14 Days for UK Used Phones",
        "30 Days for Brand New Phones",
        "No warranty covers liquid damage or screen damage.",
      ],
    },
  },
  {
    title: "6. Refund Policy",
    body: [
      `Refunds are considered in the following situations:`,
    ],
    list: [
      "Your order is cancelled before it has been dispatched.",
      "The item you received is damaged, defective, or materially different from what was ordered.",
      "The wrong item was delivered.",
      "A warranty claim (see Section 5) is approved and a refund is agreed instead of a repair or replacement.",
    ],
    highlight: {
      heading: "HOW REFUNDS WORK",
      lines: [
        "Request a refund by contacting support@sammytechgadgets.com or +234 703 878 4788 with your order number and reason.",
        "We review your request and confirm eligibility, usually within 2 business days.",
        "Approved refunds are processed within 3–5 business days via Paystack, back to your original payment method.",
        "Depending on your bank, it can take up to 10 business days for the refund to reflect on your statement.",
      ],
    },
  },
  {
    title: "7. Account Responsibilities",
    body: [
      `You are responsible for maintaining the confidentiality of your account password and for all activity under your account. Notify us immediately if you suspect unauthorized use of your account.`,
    ],
  },
  {
    title: "8. Intellectual Property",
    body: [
      `All content on this site — including logos, product descriptions, and images — is the property of SammyTech or its licensors and may not be reproduced without permission.`,
    ],
  },
  {
    title: "9. Limitation of Liability",
    body: [
      `To the fullest extent permitted by law, SammyTech shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services, beyond the value of the order in question.`,
    ],
  },
  {
    title: "10. Governing Law",
    body: [
      `These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the courts of Nigeria.`,
    ],
  },
  {
    title: "11. Changes to These Terms",
    body: [
      `We may revise these Terms & Conditions from time to time. Continued use of our site after changes are posted constitutes your acceptance of the updated terms.`,
    ],
  },
  {
    title: "12. Contact Us",
    body: [
      `Questions about these terms? Reach us at support@sammytechgadgets.com or +234 703 878 4788.`,
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
            <FileText size={26} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Terms &amp; Conditions</h1>
          <p className="mt-3 text-primary-100 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight size={11} />
          <span className="text-neutral-600">Terms &amp; Conditions</span>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-10">
        {SECTIONS.map(({ title, body, list, highlight }) => (
          <section key={title}>
            <h2 className="text-lg font-extrabold text-neutral-800 mb-3">{title}</h2>
            {body?.map((p, i) => (
              <p key={i} className="text-sm text-neutral-500 leading-relaxed mb-3">
                {p}
              </p>
            ))}
            {list && (
              <ul className="space-y-2 mt-1">
                {list.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-500 leading-relaxed">
                    <ChevronRight size={13} className="text-primary-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {highlight && (
              <div className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                  <p className="font-extrabold text-amber-800 tracking-wide text-sm">{highlight.heading}</p>
                </div>
                <ul className="space-y-1.5">
                  {highlight.lines.map((line, i) => (
                    <li key={i} className="text-sm text-amber-700 font-medium leading-relaxed">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}

        <div className="pt-4 border-t border-neutral-200">
          <p className="text-sm text-neutral-400">
            See also our{" "}
            <Link to="/privacy-policy" className="text-primary-600 font-semibold hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
