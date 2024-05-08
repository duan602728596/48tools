import type { DraggableAttributes, Active, Over } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { Transform } from '@dnd-kit/utilities';

export interface UseDraggableReturn {
  active: Active | null;
  over: Over | null;
  attributes: DraggableAttributes;
  isDragging: boolean;
  listeners: SyntheticListenerMap | undefined;
  setNodeRef(element: HTMLElement | null): void;
  setActivatorNodeRef(element: HTMLElement | null): void;
  transform: Transform | null;
}

export interface UseSortableReturn extends UseDraggableReturn {
  setDroppableNodeRef(element: HTMLElement | null): void;
  setDraggableNodeRef(element: HTMLElement | null): void;
}