import React, { Suspense } from "react";
import { GamePageContent } from "./GamePageContent";

export const dynamic = "force-dynamic";

const BOARD_BG =
  "radial-gradient(ellipse at 50% 40%, #162033 0%, #111B2E 40%, #0B1120 100%)";

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
            background: BOARD_BG,
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
