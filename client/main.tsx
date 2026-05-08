import "./global.css";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

const showBootstrapError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  root.render(
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          width: "100%",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
          padding: "20px",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0", fontSize: "20px", fontWeight: 700 }}>
          App failed to load
        </h2>
        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#475569" }}>
          Please share this error message:
        </p>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
            background: "#0f172a",
            color: "#e2e8f0",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        >
          {message}
        </pre>
      </div>
    </div>,
  );
};

window.addEventListener("error", (event) => {
  showBootstrapError(event.error ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  showBootstrapError(event.reason);
});

void import("./App")
  .then(({ App }) => {
    root.render(<App />);
  })
  .catch((error) => {
    showBootstrapError(error);
  });
