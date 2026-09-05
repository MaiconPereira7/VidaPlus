import { useState } from "react";
import { ClipboardList } from "lucide-react";

export default function RespondentGate({ title, description, onStart }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onStart(trimmed);
  }

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-light text-accent-hover dark:bg-accent/15 dark:text-accent">
        <ClipboardList size={26} strokeWidth={1.75} />
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary">{title}</h2>
        <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu primeiro nome"
          className="w-full rounded-lg border border-border bg-bg-primary px-4 py-3 text-center text-sm text-text-primary outline-none ring-accent/40 placeholder:text-text-muted focus:ring-2"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Começar
        </button>
      </form>
    </div>
  );
}
