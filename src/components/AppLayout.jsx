import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { readJSON, writeJSON } from "../lib/storage";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => readJSON("sidebar_collapsed", false));
  const location = useLocation();

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
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
