import { Route, Routes } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="ideas" element={<ComingSoon title="أفكار المشاريع" />} />
        <Route path="ideas/:id" element={<ComingSoon title="ملف الفرصة" />} />
        <Route path="custom" element={<ComingSoon title="مشروع مخصص" />} />
        <Route path="workshops" element={<ComingSoon title="الورشات" />} />
        <Route path="workshops/:id" element={<ComingSoon title="تفاصيل الورشة" />} />
        <Route path="contact" element={<ComingSoon title="تواصل معنا" />} />
        <Route path="admin" element={<ComingSoon title="لوحة الإدارة" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
