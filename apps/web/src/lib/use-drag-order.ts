import { useState, type DragEvent } from "react";

export type DragHandleProps = {
  draggable: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
};
export type DragRowProps = {
  "data-drop-target"?: string;
  "data-dragging"?: string;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
};

// Lightweight native drag-to-reorder (no dependency). Handle-based so the
// draggable target is a dedicated grip, keeping inputs inside a row fully
// usable. Spread `handleProps(id)` on the grip and `rowProps(id)` on the row;
// `onReorder` receives the new id order to persist. Arrow buttons stay as the
// keyboard-accessible fallback.
export function useDragOrder<T extends { id: string }>(
  items: T[],
  onReorder: (ids: string[]) => void,
) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const reset = () => {
    setDragId(null);
    setOverId(null);
  };

  const handleProps = (id: string): DragHandleProps => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      setDragId(id);
      e.dataTransfer.effectAllowed = "move";
      // Firefox needs data set for a drag to start.
      e.dataTransfer.setData("text/plain", id);
    },
    onDragEnd: reset,
  });

  const rowProps = (id: string): DragRowProps => ({
    "data-drop-target": overId === id && dragId !== id ? "" : undefined,
    "data-dragging": dragId === id ? "" : undefined,
    onDragOver: (e: DragEvent) => {
      if (!dragId) return;
      e.preventDefault();
      if (overId !== id) setOverId(id);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      if (dragId && dragId !== id) {
        const ids = items.map((i) => i.id);
        const from = ids.indexOf(dragId);
        const to = ids.indexOf(id);
        if (from !== -1 && to !== -1) {
          ids.splice(to, 0, ids.splice(from, 1)[0]);
          onReorder(ids);
        }
      }
      reset();
    },
  });

  return { handleProps, rowProps, dragId };
}
