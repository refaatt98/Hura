import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { SiteProvider } from "./components/SiteProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// After a new deploy, an old open tab may ask for files that no longer exist — reload to get the new version.
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

// If the app runs 10s without crashing, allow one automatic retry again in the future.
setTimeout(() => {
  try {
    sessionStorage.removeItem("hura.retried");
  } catch {
    /* ignore */
  }
}, 10000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SiteProvider>
          <App />
        </SiteProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
