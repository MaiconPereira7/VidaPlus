export default function Card({ children, className = "", hoverable = true, ...props }) {
  return (
    <div
      className={`rounded-xl border border-transparent bg-bg-card p-4 shadow-sm transition-shadow duration-200 dark:border-border dark:shadow-none md:p-5 ${
        hoverable ? "hover:shadow-md dark:hover:shadow-none" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
