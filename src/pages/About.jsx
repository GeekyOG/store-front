import { Link } from "react-router-dom";
import { ShieldCheck, Zap, Users, HeartHandshake, ChevronRight } from "lucide-react";

const VALUES = [
  {
    icon: ShieldCheck,
    color: "#07b6b0",
    bg: "#07b6b015",
    title: "Trust & Transparency",
    desc: "Every product listing is verified and every price is exactly what you pay — no hidden fees, ever.",
  },
  {
    icon: Zap,
    color: "#f59e0b",
    bg: "#f59e0b15",
    title: "Speed & Reliability",
    desc: "Fast delivery, real-time stock updates, and an experience engineered to never waste your time.",
  },
  {
    icon: Users,
    color: "#8b5cf6",
    bg: "#8b5cf615",
    title: "Community First",
    desc: "We started as a local store and still treat every customer like a neighbour, not a number.",
  },
  {
    icon: HeartHandshake,
    color: "#ef4444",
    bg: "#ef444415",
    title: "Genuine Care",
    desc: "Our support team is real people who actually read your messages and work until problems are solved.",
  },
];

const STATS = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "5,000+", label: "Products Listed" },
  { value: "99.2%", label: "Positive Ratings" },
  { value: "48 hrs", label: "Avg. Delivery Time" },
];

export default function About() {
  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight max-w-2xl mx-auto">
            We built the shop we always wanted to shop at
          </h1>
          <p className="mt-4 text-primary-100 text-lg max-w-xl mx-auto leading-relaxed">
            SammyTech was born from a simple frustration: great products hiding behind bad shopping experiences.
            We set out to fix that.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-md"
          >
            Browse Our Products <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-100">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center px-4 py-2">
              <p className="text-3xl font-extrabold text-primary-600">{value}</p>
              <p className="text-sm text-neutral-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-16 space-y-20">

        {/* ── Mission ──────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">Our Mission</span>
            <h2 className="mt-2 text-3xl font-extrabold text-neutral-800 leading-snug">
              Making quality products accessible to everyone
            </h2>
            <p className="mt-4 text-neutral-500 leading-relaxed">
              We believe access to quality shouldn't depend on where you live or how connected you are.
              SammyTech brings verified products from trusted sellers straight to your door — with the
              kind of service that turns first-time buyers into lifelong customers.
            </p>
            <p className="mt-3 text-neutral-500 leading-relaxed">
              From electronics and gadgets to everyday essentials, every item on our platform goes
              through a quality check before it reaches you.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 p-10 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center mx-auto shadow-lg">
                <ShieldCheck size={36} className="text-white" />
              </div>
              <p className="text-lg font-bold text-primary-700 mt-4">Verified. Trusted. Delivered.</p>
              <p className="text-sm text-primary-600/70 max-w-[200px] mx-auto">
                Every product. Every order. Every time.
              </p>
            </div>
          </div>
        </section>

        {/* ── Values ───────────────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">What We Stand For</span>
            <h2 className="mt-2 text-3xl font-extrabold text-neutral-800">Our core values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: bg }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-800">{title}</h3>
                  <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white p-10 text-center">
          <h2 className="text-2xl font-extrabold">Ready to start shopping?</h2>
          <p className="text-primary-100 mt-2">
            Join thousands of happy customers who trust SammyTech.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/products"
              className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-md"
            >
              Shop Now
            </Link>
            <Link
              to="/contact"
              className="border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
