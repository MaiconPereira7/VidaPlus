import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { readJSON, writeJSON } from "../lib/storage";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => readJSON("sidebar_collapsed", false));

  useEffect(() => {
    writeJSON("sidebar_collapsed", collapsed);
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-bg-secondary md:flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-h-screen flex-1 flex-col bg-bg-primary">
        <Header />
        <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
