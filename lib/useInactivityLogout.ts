import { useEffect } from "react";
import { logout, getRole } from "./auth";

const INACTIVITY_TIME = 15 * 60 * 1000; // 15 min

export function useInactivityLogout() {
  useEffect(() => {
    const rol = getRole();

    if (rol === "kiosco") return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logout();
      }, INACTIVITY_TIME);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // iniciar

    return () => {
      clearTimeout(timeout);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, []);
}