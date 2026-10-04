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
  ...rest
}: { children: ReactNode; className?: string } & ComponentProps<typeof motion.section>) {
  return (
    <motion.section
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-card bg-surface shadow-card",
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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13.5px] font-semibold transition-colors",
        tone === "primary" && "bg-primary text-white shadow-primary",
        tone === "outline" &&
          (active
            ? "border border-primary/35 bg-primary-faint text-primary-deep"
            : "border border-line bg-surface text-ink-body hover:border-line-strong hover:text-ink"),
        tone === "soft" && "bg-subtle text-ink-body hover:bg-muted",
        className,
      )}
    >
      {icon && <Icon name={icon} size={15} />}
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
    <span className={cn("inline-flex items-center gap-1.5 text-ink-muted", className)}>
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
