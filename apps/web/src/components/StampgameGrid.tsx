"use client";

import { GridCell } from "@stampgame/ui";
import { STAMP_GRID_SIZE } from "@stampgame/config";
import type { StampEntry } from "@stampgame/db";

export interface StampgameGridProps {
  stamps: StampEntry[];
  showDate?: boolean;
  onSlotPress?: (slot: number) => void;
}

export function StampgameGrid({ stamps, showDate = false, onSlotPress }: StampgameGridProps) {
  const map = new Map<number, StampEntry>();
  stamps.forEach((entry) => map.set(entry.slot, entry));
  const nextAvailableSlot = Array.from({ length: STAMP_GRID_SIZE }, (_, idx) => idx + 1).find(
    (slot) => !map.has(slot)
  );

  return (
    <div className="grid grid-cols-5 gap-3">
      {Array.from({ length: STAMP_GRID_SIZE }, (_, idx) => {
        const slot = idx + 1;
        const entry = map.get(slot);
        const handlePress = !entry && onSlotPress ? () => onSlotPress(slot) : undefined;
        return (
          <GridCell
            key={slot}
            index={slot}
            stamped={Boolean(entry)}
            dateLabel={showDate && entry ? entry.localDayJst : undefined}
            highlight={slot === nextAvailableSlot}
            onClick={handlePress}
          />
        );
      })}
    </div>
  );
}
