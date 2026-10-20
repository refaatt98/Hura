import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Ideas from "./pages/Ideas";
import IdeaDetail from "./pages/IdeaDetail";
import CustomProject from "./pages/CustomProject";
import Workshops from "./pages/Workshops";
import WorkshopDetail from "./pages/WorkshopDetail";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

// Admin code is only downloaded when someone opens /admin
const Admin = lazy(() => import("./pages/Admin"));
const adminFallback = <div className="grid min-h-dvh place-items-center text-muted">…</div>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="ideas" element={<Ideas />} />
        <Route path="ideas/:id" element={<IdeaDetail />} />
        <Route path="custom" element={<CustomProject />} />
        <Route path="workshops" element={<Workshops />} />
        <Route path="workshops/:id" element={<WorkshopDetail />} />
        <Route path="contact" element={<Contact />} />
        <Route path="cart" element={<Checkout />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* admin has its own layout (no public header/footer) */}
      <Route path="admin" element={<Suspense fallback={adminFallback}><Admin /></Suspense>} />
      <Route path="admin/login" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
