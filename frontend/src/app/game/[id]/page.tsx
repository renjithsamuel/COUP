import React, { Suspense } from "react";
import { GamePageContent } from "./GamePageContent";

export const dynamic = "force-dynamic";

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            color: "#8B95A8",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          Loading…
        </div>
      }
    >
      <GamePageContent />
    </Suspense>
  );
}
