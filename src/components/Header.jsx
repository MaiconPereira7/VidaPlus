import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { formatFriendlyDate, todayISO } from "../lib/dates";

export default function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const firstName = user.name.split(" ")[0];
  const dateLabel = formatFriendlyDate(todayISO());

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 px-4 py-3 transition-colors duration-200 md:px-8 md:py-5 ${
        scrolled
          ? "border-b border-border bg-bg-primary/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="min-w-0">
          <h1 className="page-title truncate text-lg md:text-[28px]">Olá, {firstName}.</h1>
          <p className="hidden text-sm lowercase text-text-secondary md:block">{dateLabel}</p>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text-primary"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex"
            >
              {theme === "dark" ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
}
