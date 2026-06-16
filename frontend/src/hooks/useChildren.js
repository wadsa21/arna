import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { childrenApi } from "../services/api";
import { useUIStore } from "../store/uiStore";

/** Нормализует пагинированный/обычный ответ DRF в массив. */
const toList = (data) => (Array.isArray(data) ? data : data?.results ?? []);

/** Загружает детей родителя и авто-выбирает первого. */
export function useChildren() {
  const { selectedChildId, setSelectedChild } = useUIStore();

  const query = useQuery({
    queryKey: ["children"],
    queryFn: async () => toList((await childrenApi.list()).data),
  });

  const children = query.data ?? [];

  useEffect(() => {
    if (!selectedChildId && children.length) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChildId, setSelectedChild]);

  const selectedChild =
    children.find((c) => c.id === selectedChildId) || children[0] || null;

  return { ...query, children, selectedChild, selectedChildId, setSelectedChild };
}

export { toList };
