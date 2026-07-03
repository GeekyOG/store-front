import { Link, Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-100 flex flex-col">
      <ScrollToTop />
      {/* Minimal header */}
      <header className="px-6 py-5">
        <Link to="/" className="text-primary-600 font-extrabold text-xl tracking-tight">
          SammyTech
        </Link>
      </header>

      {/* Centered card area */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <Outlet />
      </div>
    </div>
  );
}
