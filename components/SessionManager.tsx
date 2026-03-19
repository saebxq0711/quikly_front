"use client";

import { useInactivityLogout } from "@/lib/useInactivityLogout";

export default function SessionManager() {
  useInactivityLogout();

  return null;
}