export default function Card({ children, className = "", hoverable = true, ...props }) {
  return (
    <div
      className={`rounded-xl p-4 md:rounded-2xl md:p-5 bg-bg-card border border-border/50 shadow-sm dark:border-border dark:bg-bg-card dark:shadow-none transition-shadow duration-200 ${
        hoverable
          ? "hover:shadow-md dark:hover:border-[#333]"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
