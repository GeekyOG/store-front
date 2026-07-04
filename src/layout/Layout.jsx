import { useState, useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Search, ShoppingCart, X, Package, ChevronRight,
  Mail, Phone, MapPin, UserCircle, LogOut, User, Heart, Menu,
  Home, ShoppingBag, Grid2x2, Headphones,
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

const BOTTOM_NAV_LINKS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/products", label: "Shop Now", icon: ShoppingBag },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/products?openFilters=1", label: "Categories", icon: Grid2x2 },
  { to: "/contact", label: "Contact", icon: Headphones },
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
  const cartCount = useSelector(selectCartCount);
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
    <div className="min-h-screen bg-neutral-100 font-sans flex flex-col pb-16 sm:pb-0">
      <ScrollToTop />
      {showWelcomePopup && <WelcomeDiscountModal onClose={dismissWelcomePopup} />}
        <div className="hidden sm:block border-t border-white/10 bg-red-700 py-3">
          <div className="mx-auto max-w-7xl px-4 flex items-center overflow-x-auto no-scrollbar">
          <p className="text-white text-sm font-medium">
            Welcome to SammyTech! Shop the latest deals and offers.
          </p>
          </div>
        </div>
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
        <div className="hidden sm:block border-t border-white/10 bg-red-700">
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

      {/* ── Mobile bottom navigation ──────────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {BOTTOM_NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? "text-primary-600" : "text-neutral-400"
                }`
              }
            >
              <Icon size={20} />
              {label}
              {label === "Cart" && cartCount > 0 && (
                <span className="absolute top-1 right-[24%] h-3.5 w-3.5 rounded-full bg-primary-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <a target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" class="fixed bottom-20 right-4 md:bottom-[90px] md:right-5 z-[1000] flex items-center justify-center gap-0 md:gap-3 h-14 w-14 md:h-auto md:w-auto md:min-w-[200px] px-0 md:px-6 py-0 md:py-4 rounded-full md:rounded-[50px] overflow-hidden [background:linear-gradient(135deg,rgb(40,138,1),rgb(11,66,0))] text-white font-semibold text-base no-underline shadow-[0_8px_25px_rgba(1,134,7,0.4)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[3px] opacity-100 visible translate-y-0" href="https://wa.me/+2347038784788?text=Hello%20SammyTech"><span class="absolute top-1/2 left-1/2 w-0 h-0 rounded-full bg-white/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-wa-pulse"></span><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" class="w-6 h-6 shrink-0 relative z-10" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg><span class="relative z-10 hidden md:inline">Chat with us</span></a>
    </div>
  );
}
