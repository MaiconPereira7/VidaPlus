export default function Card({ children, className = "", hoverable = true, ...props }) {
  return (
    <div
      className={`rounded-xl p-4 md:rounded-2xl md:p-5 bg-bg-card border border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] dark:border-border dark:shadow-none transition-all duration-200 ${
        hoverable
          ? "hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-px dark:hover:translate-y-0 dark:hover:border-[#333]"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
