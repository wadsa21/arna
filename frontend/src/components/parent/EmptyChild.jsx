import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Baby } from "lucide-react";
import Button from "../ui/Button";
import ChildForm from "./ChildForm";

export default function EmptyChild() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="flex h-24 w-24 animate-float items-center justify-center rounded-3xl border border-white/20 bg-white text-5xl shadow-neon-primary">
        <Baby className="h-12 w-12 text-black" />
      </div>
      <p className="max-w-sm text-lg text-text-secondary">
        {t("dashboard.no_child")}
      </p>
      <Button onClick={() => setOpen(true)}>{t("dashboard.add_child")}</Button>
      <ChildForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
