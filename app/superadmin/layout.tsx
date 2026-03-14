"use client";

import { ReactNode } from "react";
import Guard from "@/lib/guards";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function SuperadminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Guard allowedRoles={["superadmin"]}>
      <div className="flex min-h-screen bg-muted/30">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </Guard>
  );
}
