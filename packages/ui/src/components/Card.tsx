import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  footer?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { title, description, footer, className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm", // base
        "dark:border-zinc-700 dark:bg-zinc-900",
        className
      )}
      {...rest}
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="mt-4 space-y-3">{children}</div> : null}
      {footer ? <div className="mt-6 border-t pt-4 text-sm">{footer}</div> : null}
    </div>
  );
});
