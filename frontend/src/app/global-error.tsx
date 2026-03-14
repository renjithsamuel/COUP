"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          padding: 48,
          background: "#111827",
          color: "#e0e0e0",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        <h2>Something went wrong!</h2>
        <p style={{ color: "#ef5350" }}>{error.message}</p>
        <button
          onClick={reset}
          style={{
            padding: "8px 24px",
            borderRadius: 8,
            border: "none",
            background: "#7B2D8E",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
