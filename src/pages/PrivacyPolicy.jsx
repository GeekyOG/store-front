import { Link } from "react-router-dom";
import { ShieldCheck, ChevronRight } from "lucide-react";

const LAST_UPDATED = "July 2, 2026";

const SECTIONS = [
  {
    title: "1. Introduction",
    body: [
      `SammyTech ("we", "us", "our") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains what information we collect, how we use it, and the choices you have when you shop with us.`,
      `By using our website and placing an order, you agree to the collection and use of information in accordance with this policy.`,
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      `When you create an account, browse our products, or place an order, we may collect:`,
    ],
    list: [
      "Personal details — name, email address, phone number, and delivery address.",
      "Order information — items purchased, order value, and payment method (we do not store your card details).",
      "Account information — password (stored securely, hashed), order history, and wishlist.",
      "Usage data — pages visited, products viewed, and general device/browser information to help us improve the site.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    list: [
      "To process and deliver your orders.",
      "To create and manage your customer account.",
      "To communicate with you about your orders, account, or promotions you've opted into.",
      "To improve our products, services, and website experience.",
      "To detect and prevent fraud or misuse of our platform.",
    ],
  },
  {
    title: "4. Sharing Your Information",
    body: [
      `We do not sell your personal information. We only share it where necessary — with delivery partners to fulfill your order, and with payment processors to complete a transaction. We may also disclose information if required by law.`,
    ],
  },
  {
    title: "5. Cookies",
    body: [
      `We use cookies and similar technologies to keep you signed in, remember items in your cart, and understand how you use our site. You can disable cookies in your browser settings, though some features may not work as intended.`,
    ],
  },
  {
    title: "6. Data Security",
    body: [
      `We take reasonable technical and organizational measures to protect your personal information from unauthorized access, loss, or misuse. Passwords are stored using industry-standard hashing and are never visible to our staff.`,
    ],
  },
  {
    title: "7. Your Rights",
    body: [
      `You can access, update, or correct your personal information at any time from your Account page. You may also request that we delete your account and associated data by contacting us.`,
    ],
  },
  {
    title: "8. Changes to This Policy",
    body: [
      `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.`,
    ],
  },
  {
    title: "9. Contact Us",
    body: [
      `If you have any questions about this Privacy Policy, reach out to us at support@sammytechgadgets.com or +234 703 878 4788.`,
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Privacy Policy</h1>
          <p className="mt-3 text-primary-100 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight size={11} />
          <span className="text-neutral-600">Privacy Policy</span>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-10">
        {SECTIONS.map(({ title, body, list }) => (
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
          </section>
        ))}

        <div className="pt-4 border-t border-neutral-200">
          <p className="text-sm text-neutral-400">
            See also our{" "}
            <Link to="/terms-and-conditions" className="text-primary-600 font-semibold hover:underline">
              Terms &amp; Conditions
            </Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
