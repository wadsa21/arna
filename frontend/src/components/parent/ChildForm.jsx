import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea, Select } from "../ui/Input";
import { childrenApi } from "../../services/api";

const EMPTY = { name: "", age: "", communication_level: "MEDIUM", notes: "" };

export default function ChildForm({ open, onClose, child = null }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const isEdit = !!child;
  const [form, setForm] = useState(EMPTY);

  // Префилл при открытии в режиме редактирования
  useEffect(() => {
    if (open) {
      setForm(
        child
          ? {
              name: child.name || "",
              age: child.age ?? "",
              communication_level: child.communication_level || "MEDIUM",
              notes: child.notes || "",
            }
          : EMPTY
      );
    }
  }, [open, child]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, age: form.age ? Number(form.age) : null };
      return isEdit
        ? childrenApi.update(child.id, payload)
        : childrenApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["children"] });
      toast.success(isEdit ? t("toast.saved") : t("toast.created"));
      onClose();
      setForm(EMPTY);
    },
    onError: () => toast.error(t("toast.error")),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("common.edit") : t("children.add_title")}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        <Input
          label={t("children.name")}
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label={t("children.age")}
          type="number"
          min="1"
          max="18"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />
        <Select
          label={t("children.communication_level")}
          value={form.communication_level}
          onChange={(e) =>
            setForm({ ...form, communication_level: e.target.value })
          }
        >
          {["LOW", "MEDIUM", "HIGH"].map((lvl) => (
            <option key={lvl} value={lvl}>
              {t(`children.level.${lvl}`)}
            </option>
          ))}
        </Select>
        <Textarea
          label={t("children.notes")}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
