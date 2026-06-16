import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import AnimatedBackground from "../components/ui/AnimatedBackground";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <AnimatedBackground />
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-brand text-white shadow-neon-primary">
        <Compass className="h-12 w-12" />
      </div>
      <h1 className="text-7xl font-black gradient-text">404</h1>
      <p className="text-text-secondary">Такой страницы нет</p>
      <Link to="/">
        <Button>На главную</Button>
      </Link>
    </div>
  );
}
