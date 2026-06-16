import { Link } from "react-router-dom";
import AnimatedBackground from "../components/ui/AnimatedBackground";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <AnimatedBackground />
      <div className="text-8xl">🧩</div>
      <h1 className="text-6xl font-black gradient-text">404</h1>
      <p className="text-text-secondary">Такой страницы нет</p>
      <Link to="/">
        <Button>На главную</Button>
      </Link>
    </div>
  );
}
