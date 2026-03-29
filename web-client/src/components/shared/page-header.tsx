import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  kicker: string;
  title: ReactNode;
  description?: string;
  titleClassName?: string;
}

export function PageHeader({
  kicker,
  title,
  description,
  titleClassName,
}: PageHeaderProps) {
  return (
    <section className="mb-12">
      <span className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant block mb-2">
        {kicker}
      </span>
      <h1
        className={cn(
          "text-5xl md:text-6xl font-black tracking-tighter text-black mb-4",
          titleClassName,
        )}
      >
        {title}
      </h1>
      {description && (
        <p className="text-on-surface-variant max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </section>
  );
}
