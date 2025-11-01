import { clsx } from "clsx";

export interface GridCellProps {
  index: number;
  stamped: boolean;
  dateLabel?: string;
  highlight?: boolean;
  onClick?: () => void;
}

export function GridCell({ index, stamped, dateLabel, highlight, onClick }: GridCellProps) {
  const className = clsx(
    "relative flex aspect-square items-center justify-center rounded-lg border text-lg font-semibold transition",
    stamped ? "border-emerald-500 bg-emerald-100 text-emerald-700" : "border-zinc-200 bg-white text-zinc-400",
    highlight && "ring-2 ring-amber-500"
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={clsx(
          className,
          "cursor-pointer hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        )}
      >
        <span>{index}</span>
        {dateLabel ? (
          <span className="absolute bottom-1 right-1 text-[10px] text-zinc-500">{dateLabel}</span>
        ) : null}
      </button>
    );
  }

  return (
    <div className={className}>
      <span>{index}</span>
      {dateLabel ? (
        <span className="absolute bottom-1 right-1 text-[10px] text-zinc-500">{dateLabel}</span>
      ) : null}
    </div>
  );
}
