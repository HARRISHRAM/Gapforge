import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="font-display font-extrabold text-6xl text-teal-100">404</p>
      <h1 className="font-display font-bold text-2xl text-ink-900 mt-2">Page not found</h1>
      <p className="text-ink-600 mt-2 max-w-sm">The page you're looking for doesn't exist or may have moved.</p>
      <Button variant="accent" size="lg" className="mt-6" onClick={() => navigate("/dashboard")}>
        Go to dashboard
      </Button>
    </div>
  );
}
