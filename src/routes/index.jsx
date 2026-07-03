import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import AuthLayout from "../layout/AuthLayout";
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import About from "../pages/About";
import Contact from "../pages/Contact";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsAndConditions from "../pages/TermsAndConditions";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderConfirmation from "../pages/OrderConfirmation";
import Wishlist from "../pages/Wishlist";
import Account from "../pages/Account";
import PhoneSwap from "../pages/PhoneSwap";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/",                              element: <Home /> },
      { path: "/products",                      element: <Products /> },
      { path: "/products/:id",                  element: <ProductDetail /> },
      { path: "/about",                         element: <About /> },
      { path: "/contact",                       element: <Contact /> },
      { path: "/privacy-policy",                element: <PrivacyPolicy /> },
      { path: "/terms-and-conditions",          element: <TermsAndConditions /> },
      { path: "/cart",                          element: <Cart /> },
      { path: "/checkout",                      element: <Checkout /> },
      { path: "/order-confirmation/:orderNumber", element: <OrderConfirmation /> },
      { path: "/wishlist",                      element: <Wishlist /> },
      { path: "/account",                       element: <Account /> },
      { path: "/swap",                          element: <PhoneSwap /> },
      { path: "*",                              element: <Home /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/sign-in",          element: <SignIn /> },
      { path: "/sign-up",          element: <SignUp /> },
      { path: "/forgot-password",  element: <ForgotPassword /> },
      { path: "/reset-password",   element: <ResetPassword /> },
    ],
  },
]);

export default router;
