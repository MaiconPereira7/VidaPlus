import { Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { formatFriendlyDate, todayISO } from "../lib/dates";

export default function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const firstName = user.name.split(" ")[0];
  const dateLabel = formatFriendlyDate(todayISO());
  const dateCap = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg-primary/85 px-4 py-3 backdrop-blur md:px-8 md:py-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="min-w-0">
          <h1 className="page-title truncate text-lg md:text-[28px]">Olá, {firstName}!</h1>
          <p className="hidden text-sm text-text-secondary md:block">{dateCap}</p>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text-primary"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
