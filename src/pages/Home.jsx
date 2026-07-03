import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Clock,
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Package,
  Tag,
  Phone,
  Store,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  useGetPublicCmsQuery,
  useGetPublicProductsQuery,
  useGetPublicCategoriesQuery,
} from "../api/storefrontApi";
import ProductCard from "../components/ProductCard";

// ── Auto-swiping product carousel ───────────────────────────────────────────────
function ProductCarousel({ products, delay = 2000, reverse = false }) {
  const autoplayRef = useRef({
    delay,
    disableOnInteraction: false,
    reverseDirection: reverse,
  });
  return (
    <Swiper
      modules={[Autoplay]}
      autoplay={autoplayRef.current}
      loop={products.length > 5}
      spaceBetween={16}
      slidesPerView={2}
      breakpoints={{
        640: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
        1280: { slidesPerView: 5 },
      }}
    >
      {products.map((p) => {
        
        return(
        <SwiperSlide key={p.id}>
          <ProductCard product={p}  />
        </SwiperSlide>
      )})}
    </Swiper>
  );
}

// ── Promo banner slider ─────────────────────────────────────────────────────────
function BannerSlider({ banners }) {
  const autoplayRef = useRef({ delay: 4000, disableOnInteraction: false });
  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      autoplay={autoplayRef.current}
      // navigation={banners.length > 1}
      pagination={banners.length > 1 ? { clickable: true } : false}
      loop={banners.length > 1}
      className="w-full h-full mx-auto max-w-6xl overflow-hidden bg-primary-700"
      style={{ "--swiper-pagination-color": "#ef4444" }}
    >
      {banners.map((banner, index) => (
        <SwiperSlide key={index}>
          <img
            src={banner}
            alt={`Promotion ${index + 1}`}
            className="w-full h-full object-cover object-center"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

// ── Category sidebar ─────────────────────────────────────────────────────────
function CategorySidebar({ categories }) {
  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="h-full min-h-[320px] rounded-2xl border border-neutral-200 bg-white overflow-y-auto">
        <ul className="divide-y divide-neutral-50">
          {categories?.slice(0, 8).map((cat) => (
            <li key={cat.id}>
              <Link
                to={`/products?category=${cat.id}`}
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors"
              >
                <Tag size={15} className="text-neutral-300 shrink-0" />
                <span className="truncate">{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

// ── Call-to-action sidebar ────────────────────────────────────────────────────
function CtaSidebar() {
  return (
    <aside className="hidden xl:flex flex-col gap-2 w-56 shrink-0">
      <div className="rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-50">
        <a href="tel:+2347038784788" className="flex items-center gap-3 px-4 py-3.5 group">
          <div className="h-9 w-9 rounded-full border border-primary-200 flex items-center justify-center text-primary-600 shrink-0">
            <Phone size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-neutral-400">Call to order</p>
            <p className="text-xs font-semibold text-neutral-800 truncate group-hover:text-primary-600 transition-colors">
              +234 703 878 4788
            </p>
          </div>
        </a>
        <Link to="/contact" className="flex items-center gap-3 px-4 py-3.5 group">
          <div className="h-9 w-9 rounded-full border border-primary-200 flex items-center justify-center text-primary-600 shrink-0">
            <Store size={16} />
          </div>
          <p className="text-xs font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
            Shop With SammyTech
          </p>
        </Link>
        <Link to="/contact" className="flex items-center gap-3 px-4 py-3.5 group">
          <div className="h-9 w-9 rounded-full border border-primary-200 flex items-center justify-center text-primary-600 shrink-0">
            <Truck size={16} />
          </div>
          <p className="text-xs font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
            Send Your Packages
          </p>
        </Link>
        <Link to="/swap" className="flex items-center gap-3 px-4 py-3.5 group">
          <div className="h-9 w-9 rounded-full border border-primary-200 flex items-center justify-center text-primary-600 shrink-0">
            <RefreshCw size={16} />
          </div>
          <p className="text-xs font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
            Swap Your Phone
          </p>
        </Link>
      </div>

      <Link
        to="/products"
        className="flex-1 min-h-[140px] rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white p-5 flex flex-col justify-end"
      >
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
          Exclusive
        </p>
        <p className="text-xl font-extrabold leading-tight mt-1">
          Shop the best deals
        </p>
      </Link>
    </aside>
  );
}

// ── Countdown to midnight ──────────────────────────────────────────────────────
function useCountdown() {
  const getMs = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    return Math.max(0, end - now);
  };
  const [ms, setMs] = useState(getMs);
  useEffect(() => {
    const id = setInterval(() => setMs(getMs()), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    h: String(Math.floor(ms / 3_600_000)).padStart(2, "0"),
    m: String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, "0"),
    s: String(Math.floor((ms % 60_000) / 1_000)).padStart(2, "0"),
  };
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-100" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 w-1/3 rounded-full bg-neutral-100" />
        <div className="h-3.5 rounded bg-neutral-100" />
        <div className="h-3.5 w-2/3 rounded bg-neutral-100" />
        <div className="h-4 w-1/2 rounded bg-neutral-100 mt-1" />
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, iconBg, iconColor, title, linkTo }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div
          className="h-8 w-8 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <h2 className="text-lg font-bold text-neutral-800">{title}</h2>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          View all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Home() {
  const [page, setPage] = useState(1);

  const { data: cms } = useGetPublicCmsQuery();
  const { data: categoriesData } = useGetPublicCategoriesQuery();
  const {
    data: productsData,
    isLoading,
    isFetching,
  } = useGetPublicProductsQuery({ page, limit: 12 });

  const { h, m, s } = useCountdown();

  const categories = categoriesData ?? [];
  const bestSelling = cms?.best_selling ?? [];
  const dealOfDay = cms?.deal_of_day ?? [];
  const promoBanners = cms?.promo_banners ?? [];

  const products = productsData?.data ?? [];
  const total = productsData?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  return (
    <div>
      {/* ── Promo Banner ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-4 lg:py-6">
        <div className="flex items-stretch gap-4">
          <CategorySidebar categories={categories} />

          <div className="flex-1 min-w-0 aspect-[16/9] sm:aspect-[21/9] lg:aspect-auto rounded-md overflow-hidden">
            {promoBanners.length > 0 ? (
              <BannerSlider banners={promoBanners} />
            ) : (
              <div className="h-full bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
                <div className="px-6 sm:px-10 py-16 flex flex-col items-start gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                    Limited Time Offer
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight max-w-lg">
                    Shop the Best <br />
                    Deals Online
                  </h1>
                  <p className="text-primary-100 text-base max-w-sm">
                    Discover thousands of products at unbeatable prices
                  </p>
                  <a
                    href="#products"
                    className="mt-2 inline-block bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-md"
                  >
                    Shop Now →
                  </a>
                </div>
              </div>
            )}
          </div>

          <CtaSidebar />
        </div>
      </div>

      {/* ── Feature Badges ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-100">
          {[
            {
              Icon: Truck,
              bg: "#07b6b018",
              color: "#07b6b0",
              title: "Fast Delivery",
              desc: "Quick & reliable shipping",
            },
            {
              Icon: ShieldCheck,
              bg: "#3b82f618",
              color: "#3b82f6",
              title: "Secure Payment",
              desc: "100% secure transactions",
            },
            {
              Icon: RefreshCw,
              bg: "#8b5cf618",
              color: "#8b5cf6",
              title: "Easy Returns",
              desc: "Hassle-free return policy",
            },
            {
              Icon: Headphones,
              bg: "#f59e0b18",
              color: "#f59e0b",
              title: "24/7 Support",
              desc: "Always here to help",
            },
          ].map(({ Icon, bg, color, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-3 px-4 first:pl-0 last:pr-0 py-1"
            >
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-700 truncate">
                  {title}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Swap CTA ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 mt-8">
        <Link
          to="/swap"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white px-6 sm:px-10 py-7 text-center sm:text-left"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 hidden md:flex rounded-2xl bg-white/15  items-center justify-center shrink-0">
              <RefreshCw size={22} />
            </div>
            <div>
              <p className="text-xl font-extrabold leading-tight">Want to Swap?</p>
              <p className="text-primary-100 text-sm mt-0.5">
                Trade in your old phone and get an instant estimated value
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-md shrink-0">
            Swap Your Phone Here <ChevronRight size={16} />
          </span>
        </Link>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 space-y-14">
        {/* ── Best Selling ────────────────────────────────────────────────────── */}
        {bestSelling.length > 0 && (
          <section>
            <SectionHeader
              icon={Star}
              iconBg="#fef3c720"
              iconColor="#f59e0b"
              title="Best Selling"
              linkTo="/products"
            />
            <ProductCarousel products={bestSelling} delay={2000} />
          </section>
        )}

        {/* ── Deal of the Day ─────────────────────────────────────────────────── */}
        {dealOfDay.length > 0 && (
          <section>
            {/* Header row: title + countdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <Clock size={16} className="text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-neutral-800">
                  Deal of the Day
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-400">
                  Ends in:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { v: h, l: "HRS" },
                    { v: m, l: "MIN" },
                    { v: s, l: "SEC" },
                  ].map(({ v, l }, i) => (
                    <div key={l} className="flex items-center gap-1">
                      <div className="flex flex-col items-center">
                        <span className="bg-neutral-800 text-white rounded-lg w-11 h-10 flex items-center justify-center text-sm font-bold tabular-nums shadow-sm">
                          {v}
                        </span>
                        <span className="text-[9px] text-neutral-400 mt-0.5 font-medium">
                          {l}
                        </span>
                      </div>
                      {i < 2 && (
                        <span className="text-neutral-500 font-bold text-lg mb-3.5 mx-0.5">
                          :
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Same card style as Best Selling, sliding the opposite way at a slightly different pace */}
            <ProductCarousel products={dealOfDay} delay={2400} reverse />
          </section>
        )}

        {/* ── All Products ────────────────────────────────────────────────────── */}
        <section id="products">
          <div className="flex items-center justify-between mb-5">
            <SectionHeader
              icon={Package}
              iconBg="#07b6b015"
              iconColor="#07b6b0"
              title="All Products"
              linkTo={null}
            />
            {!isLoading && (
              <span className="text-sm text-neutral-400">{total} items</span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-neutral-200">
              <span className="text-5xl">🛍️</span>
              <p className="text-neutral-500 font-medium">No products yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                      pg === page
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
