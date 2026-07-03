import { useState, useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Search, ShoppingCart, X, Package, ChevronRight,
  Mail, Phone, MapPin, UserCircle, LogOut, User, Heart, Menu,
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
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
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

  const dismiss = () => { setQuery(""); setOpen(false); };

  return (
    <div ref={wrapRef} className={`relative ${mobile ? "w-full" : "flex-1 max-w-xl mx-auto"}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative border border-neutral-200 rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary-500 transition-all">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
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
              <span className="font-semibold text-neutral-600">"{debounced}"</span>
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
                    onClick={() => { setOpen(false); setQuery(""); }}
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
                          {product.Subcategory && ` · ${product.Subcategory.name}`}
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
                onClick={() => { setOpen(false); setQuery(""); }}
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
  const count    = useSelector(selectWishlistCount);
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
  const count    = useSelector(selectCartCount);
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

  const initials = `${customer.first_name?.[0] ?? ""}${customer.last_name?.[0] ?? ""}`.toUpperCase();

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
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">{customer.email}</p>
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
              onClick={() => { dispatch(logout()); setOpen(false); navigate("/"); }}
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
      {showWelcomePopup && <WelcomeDiscountModal onClose={dismissWelcomePopup} />}
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
            <img src="/logo.png" alt="SammyTech" className="h-20 w-auto" />
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
            <p className="font-extrabold text-xl text-white">SammyTech</p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Your trusted online marketplace for quality products at fair prices.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 w-8 rounded-full bg-primary-500" />
              <div className="h-1.5 w-4 rounded-full bg-primary-700" />
              <div className="h-1.5 w-2 rounded-full bg-primary-800" />
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Quick Links</p>
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
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Contact Us</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-primary-400 mt-0.5 shrink-0" />
                <span className="text-sm text-neutral-400">Okorodafe Roundabout, Market Rd, Oteri 333105, Delta, Nigeria</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-primary-400 shrink-0" />
                <span className="text-sm text-neutral-400">+234 703 878 4788</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-primary-400 shrink-0" />
                <span className="text-sm text-neutral-400">support@sammytechgadgets.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-neutral-500 text-xs">
              © {new Date().getFullYear()} SammyTech. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/about" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">About</Link>
              <Link to="/contact" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">Contact</Link>
              <Link to="/privacy-policy" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
