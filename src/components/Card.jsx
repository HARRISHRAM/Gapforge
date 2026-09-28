export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white border border-line rounded-card p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
