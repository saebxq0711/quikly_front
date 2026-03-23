"use client";
import { useEffect, useState } from "react";

export default function FaviconManager() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detecta el tema del sistema
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(matcher.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    matcher.addEventListener("change", handleChange);

    return () => matcher.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // Cambia el favicon dinámicamente
    const link: HTMLLinkElement | null =
      document.querySelector("link[rel~='icon']");
    if (!link) return;

    link.href = isDark
      ? "/favicons/dark/favicon-32x32.png"
      : "/favicons/light/favicon-32x32.png";
  }, [isDark]);

  return null;
}
