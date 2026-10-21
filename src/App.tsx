import React, { useState, useEffect, type ReactNode } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import CustomCursor from "./components/CustomCursor";
import BackgroundEnvironment from "./components/BackgroundEnvironment";
import LoadingScreen from "./components/LoadingScreen";
import ScrollToTopButton from "./components/ScrollToTopButton";
import Home from "./pages/Home";
import ProductListingPage from "./pages/ProductListingPage";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import HelpCenter from "./pages/HelpCenter";
import ShippingPage from "./pages/ShippingPage";
import ReturnsPage from "./pages/ReturnsPage";
import SizeGuidePage from "./pages/SizeGuidePage";
import AboutPage from "./pages/AboutPage";
import LegalPage from "./pages/LegalPage";
import PosTerminalPage from "./pages/PosTerminalPage";
import ConsumerDashboard from "./dashboards/ConsumerDashboard";
import SellerDashboard from "./dashboards/SellerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

/** Ruta protegida: requiere sesión activa. */
function Protected({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" state={{ from: loc.pathname }} replace />;
}

/** Despacha el dashboard correspondiente según el rol del usuario. */
function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "seller") return <SellerDashboard />;
  return <ConsumerDashboard />;
}

function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between w-full max-w-[100vw] overflow-x-hidden">
      <BackgroundEnvironment />
      <CustomCursor />
      <Toaster duration={3500} closeButton position="top-right" richColors />
      <Navbar />
      <CartDrawer />

      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="w-full max-w-[100vw] overflow-x-hidden"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
}

export default function App() {
  // Preloader animado de entrada
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!loadingComplete && (
          <LoadingScreen onComplete={() => setLoadingComplete(true)} />
        )}
      </AnimatePresence>

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/pos"
            element={
              <Protected>
                <PosTerminalPage />
              </Protected>
            }
          />
          <Route path="/ayuda" element={<HelpCenter />} />
          <Route path="/contacto" element={<HelpCenter />} />
          <Route path="/envios" element={<ShippingPage />} />
          <Route path="/devoluciones" element={<ReturnsPage />} />
          <Route path="/guia-talles" element={<SizeGuidePage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/legales" element={<LegalPage />} />
          <Route path="/terminos" element={<LegalPage />} />
          <Route path="/privacidad" element={<LegalPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
