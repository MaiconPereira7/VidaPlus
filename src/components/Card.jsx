export default function Card({ children, className = "", hoverable = true, ...props }) {
  return (
    <div
      className={`rounded-xl p-4 md:rounded-2xl md:p-5 bg-bg-card border border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] dark:border-border dark:shadow-none transition-all duration-200 ${
        hoverable
          ? "hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] dark:hover:border-[#333]"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
