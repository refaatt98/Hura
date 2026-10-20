import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Safety net: if anything crashes while rendering, show a friendly screen
 * instead of a blank page. Retries once automatically (e.g. after a new deploy).
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info.componentStack);
    try {
      if (!sessionStorage.getItem("hura.retried")) {
        sessionStorage.setItem("hura.retried", "1");
        window.location.reload();
      }
    } catch {
      /* storage blocked — just show the fallback */
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
        <div>
          <p className="font-display text-3xl font-black text-ink">صار خطأ بسيط</p>
          <p className="mt-3 text-ink-soft">حدّث الصفحة وبترجع تشتغل.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-accent px-8 py-3 font-bold text-paper"
          >
            تحديث الصفحة
          </button>
        </div>
      </div>
    );
  }
}
