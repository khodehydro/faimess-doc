import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Icon, type IconName } from "./Icon";
import { spring } from "../lib/motion";

/* ------------------------------------------------------------------ *
 *  Shared primitives — the soft-minimal vocabulary of the design:
 *  rounded surfaces, circular trays, hairline chips.
 * ------------------------------------------------------------------ */

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
  tone?: "white" | "subtle" | "coral" | "ink" | "ghost";
  label?: string;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function CircleButton({
  icon,
  size = "md",
  tone = "white",
  label,
  className,
  iconClassName,
  onClick,
  type = "button",
}: CircleButtonProps) {
  const dims = { sm: 30, md: 36, lg: 42 }[size];
  const tones: Record<string, string> = {
    white: "bg-white text-ink shadow-sm ring-1 ring-line",
    subtle: "bg-subtle text-ink-body hover:bg-muted",
    coral: "bg-coral text-white shadow-coral",
    ink: "bg-ink text-white shadow-md",
    ghost: "text-ink-muted hover:bg-muted hover:text-ink",
  };

  return (
    <motion.button
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.93 }}
      transition={spring}
      className={cn(
        "group inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
        tones[tone],
        className,
      )}
      style={{ width: dims, height: dims }}
    >
      <Icon name={icon} size={size === "sm" ? 15 : 17} className={iconClassName} />
    </motion.button>
  );
}

/** icon + label metadata row used under card titles */
export function Meta({
  icon,
  children,
  className,
  iconSize = 13,
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
