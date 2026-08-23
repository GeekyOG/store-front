import { useState, useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  X,
  Package,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  UserCircle,
  LogOut,
  User,
  Heart,
  Menu,
  Facebook,
  Instagram,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentCustomer, logout } from "../store/authSlice";
import { selectCartCount } from "../store/cartSlice";
import { selectWishlistCount } from "../store/wishlistSlice";
import { useGetPublicProductsQuery } from "../api/storefrontApi";
import WelcomeDiscountModal from "../components/WelcomeDiscountModal";
import ScrollToTop from "../components/ScrollToTop";

const POPUP_DISMISSED_KEY = "sf_popup_dismissed";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/share/1GbHdjLAAq/",
    label: "Facebook",
    Icon: Facebook,
  },
  {
    href: "https://www.instagram.com/myflexishop?igsh=NjFrOWJyc3dlZGRp",
    label: "Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.threads.com/@myflexishop",
    label: "Threads",
    Icon: ThreadsIcon,
  },
  {
    href: "https://www.tiktok.com/@myflexishop?_t=ZS-903LCJSQLqK&_r=1",
    label: "TikTok",
    Icon: TikTokIcon,
  },
];

// ── Brand icons not covered by lucide-react ───────────────────────────────────
function ThreadsIcon(props) {
  return (
    <svg viewBox="0 0 192 192" fill="currentColor" {...props}>
      <path d="M141.537 88.988a67.128 67.128 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1-.108 0-.216 0-.324 0-14.906 0-27.302 6.365-34.922 17.939l13.706 9.4c5.708-8.66 14.655-10.505 21.242-10.505.083 0 .167 0 .25.001 8.235.053 14.448 2.446 18.464 7.107 2.921 3.396 4.874 8.093 5.852 14.05-7.302-1.24-15.211-1.621-23.665-1.135-23.809 1.371-39.108 15.312-38.076 34.687.523 9.828 5.398 18.253 13.727 23.722 7.045 4.626 16.126 6.891 25.557 6.378 12.498-.68 22.302-5.462 29.14-14.212 5.194-6.65 8.475-15.26 9.938-26.245 5.972 3.605 10.393 8.353 12.821 14.045 4.113 9.639 4.363 25.495-8.517 38.376-11.281 11.281-24.858 16.157-45.373 16.312-22.766-.171-39.945-7.476-51.058-21.716-10.408-13.34-15.786-32.632-15.988-57.34.202-24.708 5.58-44 15.988-57.34 11.113-14.24 28.292-21.545 51.058-21.716 22.928.172 40.407 7.514 51.944 21.822 10.658 13.219 16.169 31.633 16.386 54.74l17.021-.028c-.263-27.312-6.986-49.583-19.988-66.246C133.998 3.13 111.762-4.32 84.03-4.5H83.9c-27.66.18-49.62 7.643-65.284 22.19C2.9 32.61-3.982 53.31-4.5 84.5v.001c.518 31.19 7.4 51.89 23.116 67.11 15.664 14.547 37.624 22.01 65.284 22.19h.13c25.31-.207 42.964-6.902 57.283-21.708 18.71-19.343 18.17-43.556 12.005-58.475-4.42-10.68-12.836-19.32-24.281-24.63Zm-45.037 46.5c-9.53.528-19.436-3.783-19.928-13.017-.365-6.856 4.898-14.508 20.507-15.406a92.02 92.02 0 0 1 5.395-.157c5.803 0 11.238.532 16.184 1.55-1.845 22.914-12.669 26.612-22.158 27.03Z" />
    </svg>
  );
}

function TikTokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 5.82c-1.03-.87-1.7-2.1-1.86-3.5h-3.03v13.4a2.99 2.99 0 1 1-2.99-3.03c.29 0 .58.05.85.14V9.66a6.03 6.03 0 0 0-.85-.06 6.05 6.05 0 1 0 6.05 6.05V8.44a8.16 8.16 0 0 0 4.76 1.53V6.94a4.85 4.85 0 0 1-2.93-1.12Z" />
    </svg>
  );
}

// ── Search bar with live suggestions ──────────────────────────────────────────
function SearchBar({ mobile = false }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 280);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useGetPublicProductsQuery(
    { search: debounced, limit: 6 },
    { skip: debounced.trim().length < 2 },
  );
  const suggestions = data?.data ?? [];
  const showDropdown = open && debounced.trim().length >= 2;

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/products?search=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
  };

  const dismiss = () => {
    setQuery("");
    setOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className={`relative ${mobile ? "w-full" : "flex-1 max-w-xl mx-auto"}`}
    >
      <form onSubmit={handleSubmit}>
        <div className="relative border border-neutral-200 rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary-500 transition-all">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => debounced.trim().length >= 2 && setOpen(true)}
            placeholder="Search for products…"
            className="w-full pl-9 pr-9 py-2 rounded-xl border-0 text-sm bg-white outline-none shadow-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-white/20 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </form>

      {/* ── Suggestions dropdown ──────────────────────────────────────────────── */}
      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-neutral-100 shadow-2xl overflow-hidden z-50">
          {/* Loading */}
          {isFetching && suggestions.length === 0 && (
            <div className="flex items-center gap-2.5 px-4 py-3 text-sm text-neutral-400">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-neutral-200 border-t-primary-500 animate-spin inline-block" />
              Searching…
            </div>
          )}

          {/* Empty */}
          {!isFetching && suggestions.length === 0 && (
            <div className="px-4 py-4 text-sm text-neutral-400 text-center">
              No results for{" "}
              <span className="font-semibold text-neutral-600">
                "{debounced}"
              </span>
            </div>
          )}

          {/* Results */}
          {suggestions.length > 0 && (
            <>
              <div className="px-3.5 pt-2.5 pb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Suggestions
                </p>
              </div>

              {suggestions.map((product) => {
                const thumb =
                  product.featured_image ||
                  product.StorefrontImages?.[0]?.image_data;
                const price = product.discount_price ?? product.regular_price;
                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-primary-50 transition-colors border-t border-neutral-50 group"
                  >
                    {/* Thumbnail */}
                    <div className="h-11 w-11 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-100">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package size={16} className="text-neutral-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-700 truncate group-hover:text-primary-700 transition-colors">
                        {product.display_name}
                      </p>
                      {product.Category && (
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                          {product.Category.name}
                          {product.Subcategory &&
                            ` · ${product.Subcategory.name}`}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary-600">
                        ₦{price?.toLocaleString()}
                      </p>
                      {product.discount_price && (
                        <p className="text-[10px] text-neutral-400 line-through">
                          ₦{product.regular_price?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* See all */}
              <Link
                to={`/products?search=${encodeURIComponent(debounced.trim())}`}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-3 bg-neutral-50 hover:bg-primary-50 text-sm text-primary-600 font-semibold border-t border-neutral-100 transition-colors"
              >
                See all results for "{debounced}"
                <ChevronRight size={14} />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Wishlist button ────────────────────────────────────────────────────────────
function WishlistButton() {
  const navigate = useNavigate();
  const count = useSelector(selectWishlistCount);
  return (
    <button
      onClick={() => navigate("/wishlist")}
      className="relative p-2 rounded-xl text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 transition-all"
      title="Wishlist"
    >
      <Heart size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

// ── Cart button ────────────────────────────────────────────────────────────────
function CartButton() {
  const navigate = useNavigate();
  const count = useSelector(selectCartCount);
  return (
    <button
      onClick={() => navigate("/cart")}
      className="relative p-2 rounded-xl text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 transition-all"
      title="Cart"
    >
      <ShoppingCart size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary-400 text-[9px] font-bold text-white flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

// ── User menu ──────────────────────────────────────────────────────────────────
function UserMenu() {
  const customer = useSelector(selectCurrentCustomer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!customer) {
    return (
      <Link
        to="/sign-in"
        className="p-2 rounded-xl text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 transition-all"
        title="Sign in"
      >
        <UserCircle size={20} />
      </Link>
    );
  }

  const initials =
    `${customer.first_name?.[0] ?? ""}${customer.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 transition-all"
      >
        <div className="h-7 w-7 rounded-full bg-primary-50 text-primary-700 text-[11px] font-bold flex items-center justify-center border border-primary-100">
          {initials}
        </div>
        <span className="hidden sm:inline text-[13px] font-medium">
          {customer.first_name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-neutral-100 shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-neutral-50">
            <p className="text-xs font-bold text-neutral-800">
              {customer.first_name} {customer.last_name}
            </p>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
              {customer.email}
            </p>
          </div>
          <div className="py-1">
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              <User size={14} />
              My Account
            </Link>
            <button
              onClick={() => {
                dispatch(logout());
                setOpen(false);
                navigate("/");
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────
export default function Layout() {
  const customer = useSelector(selectCurrentCustomer);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (customer || sessionStorage.getItem(POPUP_DISMISSED_KEY)) return;
    const timer = setTimeout(() => setShowWelcomePopup(true), 800);
    return () => clearTimeout(timer);
  }, [customer]);

  // Lock body scroll and allow Escape to close while the mobile drawer is open
  useEffect(() => {
    if (!mobileNavOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e) => e.key === "Escape" && setMobileNavOpen(false);
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handler);
    };
  }, [mobileNavOpen]);

  const dismissWelcomePopup = () => {
    setShowWelcomePopup(false);
    sessionStorage.setItem(POPUP_DISMISSED_KEY, "1");
  };

  return (
    <div className="min-h-screen bg-neutral-100 font-sans flex flex-col">
      <ScrollToTop />
      {showWelcomePopup && (
        <WelcomeDiscountModal onClose={dismissWelcomePopup} />
      )}
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-neutral-50 shadow-md">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="sm:hidden shrink-0 p-2 -ml-2 rounded-xl text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 transition-all"
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src="/logo.png" alt="MyFlexShop" className="h-11 w-auto" />
          </Link>

          {/* Desktop search */}
          <div className="hidden sm:flex flex-1">
            <SearchBar />
          </div>

          {/* Wishlist + Cart + User */}
          <div className="ml-auto sm:ml-0 flex items-center gap-1">
            <WishlistButton />
            <CartButton />
            <UserMenu />
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-2">
          <SearchBar mobile />
        </div>

        {/* ── Secondary nav (desktop) ───────────────────────────────────────── */}
        <div className="hidden sm:block border-t border-white/10 bg-neutral-700/80">
          <div className="mx-auto max-w-7xl px-4 flex items-center overflow-x-auto no-scrollbar">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "text-white border-white"
                      : "text-white/65 border-transparent hover:text-white hover:border-white/30"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* ── Mobile nav drawer ──────────────────────────────────────────────── */}
      <div
        className={`sm:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          mobileNavOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden={!mobileNavOpen}
      />
      <div
        className={`sm:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-neutral-900 text-white shadow-2xl transition-transform duration-300 ease-out ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileNavOpen}
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
          <span className="font-extrabold text-lg">Menu</span>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-2 -mr-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="py-2">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 text-sm font-medium border-l-2 transition-colors ${
                  isActive
                    ? "text-white border-primary-500 bg-white/5"
                    : "text-white/70 border-transparent hover:text-white hover:bg-white/5"
                }`
              }
            >
              {label}
              <ChevronRight size={15} className="opacity-40" />
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-neutral-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <p className="font-extrabold text-xl text-white">MyFlexShop</p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Your trusted online marketplace for quality products at fair
              prices.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 w-8 rounded-full bg-primary-500" />
              <div className="h-1.5 w-4 rounded-full bg-primary-700" />
              <div className="h-1.5 w-2 rounded-full bg-primary-800" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="h-8 w-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-primary-400 hover:border-primary-400 transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Products" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-neutral-400 hover:text-primary-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight size={12} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
              Contact Us
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin
                  size={14}
                  className="text-primary-400 mt-0.5 shrink-0"
                />
                <span className="text-sm text-neutral-400">
                  4, Bolaji Ojomu, off Kukoyi, Alapere, Ketu, Lagos
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-primary-400 mt-0.5 shrink-0" />
                <span className="text-sm text-neutral-400">
                  +234 706 531 6098
                  <br />
                  +234 812 708 9505
                  <br />
                  +234 705 163 7304
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-primary-400 shrink-0" />
                <span className="text-sm text-neutral-400">
                  myflexishops@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-neutral-500 text-xs">
              © {new Date().getFullYear()} MyFlexShop. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/about"
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/privacy-policy"
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-and-conditions"
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
