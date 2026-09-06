import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNav />
      <main className="mx-auto w-full max-w-screen-2xl px-5 pb-24 pt-6 md:px-10 md:pb-10 lg:px-16">
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
      </main>
      <BottomNav />
    </div>
  );
}
