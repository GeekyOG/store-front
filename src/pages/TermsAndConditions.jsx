import { Link } from "react-router-dom";
import { FileText, ChevronRight, ShieldAlert } from "lucide-react";

const LAST_UPDATED = "July 20, 2026";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: [
      `These Terms & Conditions govern your use of the SammyTech Gadgets website and your purchase of any products from us. By accessing our website or placing an order, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website or services.`,
    ],
  },
  {
    title: "2. Products & Pricing",
    body: [
      `We strive to ensure that all product descriptions, images, specifications, and prices displayed on our website are accurate and up to date. However, errors may occasionally occur.`,
      `If a pricing or product listing error is identified after you have placed an order, we will notify you before processing your order. You may choose to proceed with the corrected information or cancel your order for a full refund.`,
    ],
  },
  {
    title: "3. Orders & Payment",
    body: [
      `An order is considered confirmed once payment has been successfully received or, for approved Pay-on-Delivery orders, once SammyTech Gadgets accepts the order.`,
    ],
    list: [
      "Order cancellation: we reserve the right to decline or cancel any order due to stock unavailability, pricing or listing errors, suspected fraudulent activity, or any other legitimate business reason.",
      "Pricing: all prices are displayed in Nigerian Naira (₦) and include applicable taxes unless otherwise stated.",
    ],
  },
  {
    title: "4. Delivery Policy",
    body: [
      `We deliver nationwide across Nigeria through trusted courier and dispatch partners.`,
    ],
    list: [
      "Delivery time: within Delta State, orders typically arrive within 24 hours. In other states, delivery takes 24–72 hours depending on your location.",
      "Delivery coverage: we deliver to all 36 states and the FCT. Delivery to remote locations may take longer than the estimated timeframe.",
      "Delivery charges: shipping fees are automatically calculated during checkout based on your delivery location, and the total delivery cost is displayed before payment.",
      "Delivery delays: delivery timelines are estimates only. SammyTech Gadgets is not responsible for delays caused by courier services, weather conditions, public holidays, security issues, or incorrect delivery information provided by the customer.",
    ],
  },
  {
    title: "5. Returns & Warranty Policy",
    body: [
      `Your satisfaction is important to us. If an eligible product develops a manufacturer-related fault during the warranty period under normal use, please contact our support team for assistance.`,
      `Warranty exclusions: physical or accidental damage, cracked or broken screens, liquid or water damage, fire or power surge damage, software issues caused by rooting or jailbreaking, unauthorized repairs or modifications, and damage caused by misuse, negligence, or improper handling.`,
      `SammyTech Gadgets reserves the right to repair, replace, or refund eligible products after inspection.`,
    ],
    highlight: {
      heading: "WARRANTY COVERAGE",
      lines: [
        "Brand New Phones: 30-Day Limited Warranty",
        "UK Used Phones: 14-Day Limited Warranty",
        "Covers manufacturer-related hardware defects under normal usage only.",
      ],
    },
  },
  {
    title: "6. Refund Policy",
    body: [
      `Refunds may be approved under the following circumstances:`,
    ],
    list: [
      "Your order is cancelled before dispatch.",
      "You receive the wrong product.",
      "The item received is damaged or defective.",
      "A warranty claim (see Section 5) is approved and a refund is offered instead of a repair or replacement.",
    ],
    highlight: {
      heading: "HOW REFUNDS WORK",
      lines: [
        "Contact us at support@sammytechgadgets.com or +234 703 878 4788 with your order number and reason for the request.",
        "Refund requests are reviewed within 2 business days.",
        "Approved refunds are processed within 3–5 business days via your original payment method.",
        "Depending on your bank, refunds may take up to 10 business days to appear.",
      ],
    },
  },
  {
    title: "7. Account Responsibilities",
    body: [
      `You are responsible for maintaining the confidentiality of your account credentials and for all activities carried out under your account. Please notify us immediately if you suspect unauthorized access or use of your account.`,
    ],
  },
  {
    title: "8. Intellectual Property",
    body: [
      `All website content, including logos, text, product descriptions, graphics, images, and other materials, is the intellectual property of SammyTech Gadgets or its licensors and may not be copied, reproduced, distributed, or used without prior written permission.`,
    ],
  },
  {
    title: "9. Limitation of Liability",
    body: [
      `To the fullest extent permitted by Nigerian law, SammyTech Gadgets shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the affected order.`,
    ],
  },
  {
    title: "10. Governing Law",
    body: [
      `These Terms & Conditions shall be governed by and interpreted in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.`,
    ],
  },
  {
    title: "11. Changes to These Terms",
    body: [
      `SammyTech Gadgets reserves the right to update or modify these Terms & Conditions at any time. Changes become effective immediately upon publication on our website. Continued use of our website constitutes acceptance of the revised Terms & Conditions.`,
    ],
  },
  {
    title: "12. Contact Us",
    body: [
      `If you have any questions regarding these Terms & Conditions, please contact us at support@sammytechgadgets.com or +234 703 878 4788.`,
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
