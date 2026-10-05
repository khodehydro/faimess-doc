import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Icon, type IconName } from "./Icon";
import { spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Shared primitives — the soft-minimal vocabulary of the design.
 * ------------------------------------------------------------------ */

/** Page-level content card: one of the two big cards on the home screen. */
export function SurfaceCard({
  children,
  className,
  glass = false,
  ...rest
}: { children: ReactNode; className?: string; glass?: boolean } & ComponentProps<typeof motion.section>) {
  return (
    <motion.section
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-card shadow-card",
        glass
          ? "bg-white/80 ring-1 ring-white/70 backdrop-blur-md dark:bg-surface/80 dark:ring-white/[0.06]"
          : "bg-surface",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.section>
  );
}

export function Card({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & ComponentProps<typeof motion.div>) {
  return (
    <motion.div className={cn("rounded-card bg-surface shadow-card", className)} {...rest}>
      {children}
    </motion.div>
  );
}

type CircleButtonProps = {
  icon: IconName;
  size?: "sm" | "md" | "lg";
  tone?: "white" | "subtle" | "primary" | "ink" | "ghost";
  label?: string;
  className?: string;
  iconClassName?: string;
  iconStroke?: number;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function CircleButton({
  icon,
  size = "md",
  tone = "white",
  label,
  className,
  iconClassName,
  iconStroke,
  onClick,
  type = "button",
  disabled,
}: CircleButtonProps) {
  const dims = { sm: 32, md: 38, lg: 44 }[size];
  const tones: Record<string, string> = {
    white: "bg-surface text-ink shadow-sm ring-1 ring-line hover:text-primary-deep hover:ring-primary/30",
    subtle: "bg-subtle text-ink-body hover:bg-muted",
    primary: "bg-primary text-white shadow-primary hover:bg-primary-deep",
    ink: "bg-ink text-white shadow-md",
    ghost: "text-ink-muted hover:bg-muted hover:text-ink",
  };

  return (
    <motion.button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.93 }}
      transition={spring}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
        tones[tone],
        disabled && "cursor-not-allowed opacity-45",
        className,
      )}
      style={{ width: dims, height: dims }}
    >
      <Icon name={icon} size={size === "sm" ? 16 : 18} strokeWidth={iconStroke} className={iconClassName} />
    </motion.button>
  );
}

type PillButtonProps = {
  children: ReactNode;
  icon?: IconName;
  active?: boolean;
  tone?: "outline" | "soft" | "primary";
  className?: string;
  onClick?: () => void;
};

/* ------------------------------------------------------------------ *
 *  ExpandPill — the minimal control the detail cards use.
 *
 *  At rest it is only its glyph; the word unfolds beside it on hover (and
 *  for keyboards, and on phone widths, where there is no hover to give).
 *  The width animates with CSS, so the label never reflows the row while
 *  it is hidden — nothing in the header jumps when the pointer arrives.
 * ------------------------------------------------------------------ */

type ExpandPillProps = {
  icon: IconName;
  children: string;
  tone?: "primary" | "outline";
  /** the accessible name, when the visible word is shorter */
  label?: string;
  onClick?: () => void;
};

export function ExpandPill({ icon, children, tone = "outline", label, onClick }: ExpandPillProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      transition={spring}
      onClick={onClick}
      aria-label={label ?? children}
      title={label ?? children}
      className={cn(
        "group flex shrink-0 items-center rounded-full border px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors lg:px-3 lg:py-2 lg:text-[13px]",
        tone === "primary"
          ? "border-transparent bg-primary text-white shadow-primary hover:bg-primary-deep"
          : "border-line bg-surface text-ink-body hover:border-primary/35 hover:bg-primary-faint hover:text-primary-deep",
      )}
    >
      <Icon name={icon} size={14.5} strokeWidth={2.1} className="shrink-0 lg:hidden" />
      <Icon name={icon} size={15.5} strokeWidth={2.1} className="hidden shrink-0 lg:block" />
      <span
        className={cn(
          "max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin] duration-300 ease-out",
          "group-hover:ms-2 group-hover:max-w-[12rem] group-hover:opacity-100",
          "group-focus-visible:ms-2 group-focus-visible:max-w-[12rem] group-focus-visible:opacity-100",
          /* under 1024px there is no hover to give away the word */
          "max-lg:ms-2 max-lg:max-w-[12rem] max-lg:opacity-100",
        )}
      >
        {children}
      </span>
    </motion.button>
  );
}

export function PillButton({
  children,
  icon,
  active,
  tone = "outline",
  className,
  onClick,
}: PillButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      className={cn(
        /* a step smaller under 1024px: the pills sit next to a title in a
           shelf header there, and the desktop size made the row overflow */
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors lg:gap-2 lg:px-3.5 lg:py-2 lg:text-[13.5px]",
        tone === "primary" && "bg-primary text-white shadow-primary",
        tone === "outline" &&
          (active
            ? "border border-primary/35 bg-primary-faint text-primary-deep"
            : "border border-line bg-surface text-ink-body hover:border-line-strong hover:text-ink"),
        tone === "soft" && "bg-subtle text-ink-body hover:bg-muted",
        className,
      )}
    >
      {icon && (
        <>
          <Icon name={icon} size={13.5} className="lg:hidden" />
          <Icon name={icon} size={15} className="hidden lg:block" />
        </>
      )}
      {children}
    </motion.button>
  );
}

/** icon + label metadata row used under card titles */
export function Meta({
  icon,
  children,
  className,
  iconSize = 14,
}: {
  icon: IconName;
  children: ReactNode;
  className?: string;
  iconSize?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink-muted", className)}>
      <Icon name={icon} size={iconSize} />
      {children}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return <span className={cn("block h-px w-full bg-line", className)} />;
}

/** small pulsing dot — presence / live */
export function Dot({ className, tone = "mint" }: { className?: string; tone?: "mint" | "primary" | "teal" }) {
  return (
    <span className={cn("relative flex size-2", className)}>
      <span
        className={cn(
          "absolute inline-flex size-full rounded-full opacity-60",
          tone === "mint" && "bg-mint",
          tone === "primary" && "bg-primary",
          tone === "teal" && "bg-teal",
        )}
        style={{ animation: "fi-pulse-ring 2.4s ease-out infinite" }}
      />
      <span
        className={cn(
          "relative inline-flex size-2 rounded-full",
          tone === "mint" && "bg-mint",
          tone === "primary" && "bg-primary",
          tone === "teal" && "bg-teal",
        )}
      />
    </span>
  );
}
