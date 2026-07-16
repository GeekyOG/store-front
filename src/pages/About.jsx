import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  Lock,
  Tag,
  HeartHandshake,
  Star,
  ChevronRight,
  Target,
  Eye,
  Smartphone,
  Laptop,
  Gamepad2,
  Watch,
  Repeat,
  Wrench,
  Package,
  Users,
  Building2,
  CalendarDays,
  Headphones,
  Briefcase,
} from "lucide-react";
import founderPhoto from "../assets/founder.jpg";

const FOUNDER_ROLES = [
  "Founder & CEO, SammyTech Gadgets",
  "CEO, Sameg Dreamland Properties",
  "Chairman, Sameg Group",
];

const FOUNDER_BADGES = [
  { icon: Users, title: "Trusted by Thousands", desc: "Across Nigeria" },
  { icon: ShieldCheck, title: "100% Genuine Products", desc: "Authenticity Guaranteed" },
  { icon: Building2, title: "2+ Business Locations", desc: "Serving You Better" },
  { icon: CalendarDays, title: "Since 2018", desc: "Years of Trust & Excellence" },
  { icon: Truck, title: "Nationwide Delivery", desc: "Fast & Reliable" },
  { icon: Headphones, title: "Excellent Customer Support", desc: "Always Here for You" },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    color: "#ef4444",
    bg: "#ef444415",
    title: "100% Genuine Devices",
    desc: "Every smartphone, laptop, smartwatch, and accessory is thoroughly verified for authenticity. No imitations. No compromises. Just genuine products you can trust.",
  },
  {
    icon: Truck,
    color: "#ef4444",
    bg: "#ef444415",
    title: "Fast Nationwide Delivery",
    desc: "We deliver genuine gadgets to customers across Nigeria with speed, care, and professionalism—ensuring every order reaches you safely and on schedule.",
  },
  {
    icon: Lock,
    color: "#ef4444",
    bg: "#ef444415",
    title: "Shop with Complete Confidence",
    desc: "Confidence Every payment is encrypted, every transaction is secure, and every order is handled with the highest level of professionalism—giving you peace of mind from checkout to delivery.",
  },
  {
    icon: Tag,
    color: "#ef4444",
    bg: "#ef444415",
    title: "Premium Gadgets. Fair Prices.",
    desc: "We believe genuine technology should offer exceptional value. That's why we provide competitive, transparent pricing without compromising on authenticity or quality.",
  },
  {
    icon: HeartHandshake,
    color: "#ef4444",
    bg: "#ef444415",
    title: "Guiding You to the Right Choice",
    desc: "We don't just sell gadgets—we help you choose the device that best fits your needs, lifestyle, and budget. Expect honest recommendations, transparent pricing, and service you can trust.",
  },
  {
    icon: Star,
    color: "#ef4444",
    bg: "#ef444415",
    title: "Exceptional Customer Support",
    desc: "Real people who genuinely care, built on the same customer-first approach we started with in a gadget store years ago.",
  },
];

const OFFERINGS = [
  {
    icon: Smartphone,
    title: "Smartphones",
    desc: "A wide selection of brand-new and UK-used smartphones from Apple, Samsung, Google Pixel, Xiaomi, Tecno, Infinix, Oppo, and more.",
  },
  {
    icon: Laptop,
    title: "Laptops",
    desc: "Genuine laptops for students, professionals, creatives, and businesses—from everyday machines to high-performance builds.",
  },
  {
    icon: Gamepad2,
    title: "Gaming",
    desc: "PlayStation consoles, PS5 games, controllers, and gaming accessories to upgrade your experience.",
  },
  {
    icon: Watch,
    title: "Smart Devices & Accessories",
    desc: "Smartwatches, AirPods, earbuds, chargers, power banks, phone cases, screen protectors, keyboards, mice, and more.",
  },
  {
    icon: Repeat,
    title: "Buy • Sell • Swap",
    desc: "Looking to upgrade? We make it easy to buy, sell, or swap your devices at competitive market prices.",
  },
  {
    icon: Wrench,
    title: "Device Repairs & Support",
    desc: "Professional diagnostics, repairs, software installation, device setup, and technical support from experienced technicians.",
  },
  {
    icon: Package,
    title: "Wholesale Supply",
    desc: "We partner with retailers, businesses, and resellers by supplying genuine gadgets at competitive wholesale prices.",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    desc: "Order from anywhere in Nigeria through our website and enjoy fast, secure, and reliable doorstep delivery.",
  },
];

const STATS = [
  { value: "2018", label: "Founded" },
  { value: "10,000+", label: "Customers Served" },
  { value: "2", label: "Physical Stores" },
  { value: "Nationwide", label: "Delivery Coverage" },
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
            Started with Passion. Built on Trust.
          </h1>
          <p className="mt-4 text-primary-100 text-lg max-w-xl mx-auto leading-relaxed">
            Every successful business starts with a dream. Ours began with a passion for technology and a
            simple goal: helping people stay connected.
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

        {/* ── Meet Our Founder ─────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">Meet Our Founder</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-[340px]">
              <img
                src={founderPhoto}
                alt="P. Amb. Udi Samuel Oruese — Founder & CEO, SammyTech Gadgets"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5">
                <p className="text-white font-bold text-lg">Udi Samuel Oruese  (P. Amb.)</p>
                <p className="text-white/80 text-sm">Founder & CEO, SammyTech Gadgets</p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-neutral-800 leading-snug">
                P. Amb. Udi Samuel Oruese
              </h2>
              <ul className="mt-3 space-y-1.5">
                {FOUNDER_ROLES.map((role) => (
                  <li key={role} className="flex items-center gap-2 text-sm text-neutral-500">
                    <Briefcase size={14} className="text-primary-600 shrink-0" />
                    {role}
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-neutral-500 leading-relaxed">
                P. Amb. Udi Samuel Oruese is the Founder & CEO of SammyTech Gadgets, CEO of Sameg
                Dreamland Properties, and Chairman of Sameg Group, providing strategic leadership
                across a growing portfolio of businesses.
              </p>
              <p className="mt-3 text-neutral-500 leading-relaxed">
                Driven by a passion for technology and entrepreneurship, he founded{" "}
                <span className="font-semibold text-neutral-700">SammyTech Gadgets in 2018</span> with
                a mission to make genuine smartphones, laptops, gaming devices, and accessories
                accessible through integrity, quality, and exceptional customer service.
              </p>
              <p className="mt-3 text-neutral-500 leading-relaxed">
                Beyond technology, he leads Sameg Dreamland Properties, helping individuals, families,
                and investors access genuine, secure, and affordable real estate opportunities while
                creating lasting value and sustainable communities.
              </p>

              <blockquote className="mt-5 rounded-xl bg-primary-50 border-l-4 border-primary-600 px-4 py-3 text-sm text-primary-700 italic">
                “Our reputation is built on trust, and every delivery is a reflection of that
                commitment.”
              </blockquote>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FOUNDER_BADGES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-neutral-200 bg-white p-4 text-center hover:shadow-md transition-shadow"
              >
                <Icon size={20} className="text-primary-600 mx-auto" />
                <p className="mt-2 text-xs font-bold text-neutral-800 leading-tight">{title}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Origin story ─────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">How It Began</span>
            <h2 className="mt-2 text-3xl font-extrabold text-neutral-800 leading-snug">
              From a gadget store to a trusted brand
            </h2>
            <p className="mt-4 text-neutral-500 leading-relaxed">
              Long before SammyTech Gadgets became a trusted technology brand, our journey started by
              helping people download music, configure mobile phones, and set up internet browsing.
              Those early experiences taught us an important lesson—technology should be simple,
              accessible, and backed by genuine customer care.
            </p>
            <p className="mt-3 text-neutral-500 leading-relaxed">
              While studying at the University of Benin, that passion evolved into a growing business.
              Friends and fellow students relied on us whenever they needed affordable smartphones or
              reliable laptops—helping them choose devices suitable for final-year projects, programming,
              graphic design, and everyday academic work.
            </p>
            <p className="mt-3 text-neutral-500 leading-relaxed">
              As demand grew, we began investing our own savings into buying and selling smartphones.
              What started with just a few devices quickly grew into something much bigger.
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

        {/* ── Building SammyTech ──────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">Growing the Dream</span>
            <h2 className="mt-2 text-3xl font-extrabold text-neutral-800">Building SammyTech</h2>
          </div>
          <div className="space-y-4 max-w-3xl mx-auto text-neutral-500 leading-relaxed">
            <p>
              In 2018, SammyTech Gadgets officially opened its doors. We started by selling quality
              UK-used smartphones and laptops, built on three simple principles: genuine products, fair
              pricing, and honest service. Every customer mattered, and every sale was an opportunity to
              build lasting trust.
            </p>
            <p>
              During the COVID-19 pandemic, when many people couldn't visit physical stores, we adapted
              quickly by introducing doorstep delivery. While others slowed down, we focused on bringing
              technology directly to our customers safely and conveniently. That commitment strengthened
              the confidence customers placed in our brand.
            </p>
            <p>
              As our customer base grew, we expanded by importing devices directly, opening a second
              store, and launching a wholesale division that supplies retailers across Nigeria. Today,
              SammyTech Gadgets proudly serves thousands of customers with genuine smartphones, laptops,
              gaming consoles, smartwatches, accessories, and professional gadget services.
            </p>
          </div>
        </section>

        {/* ── What We Offer ────────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">What We Offer</span>
            <h2 className="mt-2 text-3xl font-extrabold text-neutral-800">Everything you need in technology</h2>
            <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
              Genuine technology products and exceptional services that meet your everyday needs—whether
              you're shopping for personal use, business, or gaming.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {OFFERINGS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-primary-50">
                  <Icon size={22} className="text-primary-600" />
                </div>
                <h3 className="mt-4 font-bold text-neutral-800">{title}</h3>
                <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mission & Vision ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-neutral-200 bg-white p-8">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-primary-50">
              <Target size={22} className="text-primary-600" />
            </div>
            <h3 className="mt-4 font-bold text-neutral-800 text-lg">Our Mission</h3>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
              To make genuine technology accessible through honest business practices, exceptional
              customer service, competitive pricing, and a seamless shopping experience.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-8">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-primary-50">
              <Eye size={22} className="text-primary-600" />
            </div>
            <h3 className="mt-4 font-bold text-neutral-800 text-lg">Our Vision</h3>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
              To become Africa's most trusted destination for smartphones, laptops, gaming devices, and
              consumer electronics by delivering quality, innovation, and exceptional customer
              satisfaction.
            </p>
          </div>
        </section>

        {/* ── Why customers trust us ──────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">WHY CUSTOMERS CHOOSE SAMMYTECH</span>
            <h2 className="mt-2 text-3xl font-extrabold text-neutral-800">Built on Integrity, Credibility & Transparency.</h2>
            <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
             At SammyTech Gadgets, trust is the foundation of everything we do. We believe every customer deserves genuine products, transparent pricing, and exceptional service. Our commitment to integrity, credibility, and transparency has earned the confidence of customers across Nigeria—and we strive to uphold that trust with every sale.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TRUST_POINTS.map(({ icon: Icon, color, bg, title, desc }) => (
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
          <span className="inline-block text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4">
            Everything You Need in Technology—All in One Place
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Shop Genuine. Shop Smart. Shop SammyTech.</h2>
          <p className="text-primary-100 mt-2">
            Premium Technology. Genuine Products. Trusted Service.
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
              Contact Us
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
