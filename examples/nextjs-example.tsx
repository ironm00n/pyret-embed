"use client";

import React, { useEffect, useRef } from "react";
import { makeEmbedConfig } from "@ironm00n/pyret-embed";

export default function PyretEmbedExample() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initPyret = async () => {
      try {
        await makeEmbedConfig({
          container: containerRef.current!,
          state: {
            editorContents: "use context starter2024\n\n'Hello from Next.js!'",
            replContents: "",
            definitionsAtLastRun: "",
            interactionsSinceLastRun: [],
          },
          options: {
            footerStyle: "hide",
            warnOnExit: false,
          },
        });
      } catch (error) {
        console.error("Failed to initialize Pyret:", error);
      }
    };

    initPyret();
  }, []);

  return (
    <div className="w-full h-screen">
      <h1 className="text-2xl font-bold mb-4">Pyret Embed in Next.js</h1>
      <div
        ref={containerRef}
        className="w-full h-96 border border-gray-300 rounded-lg"
      />
    </div>
  );
}
