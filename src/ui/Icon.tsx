import { useId, useMemo, type SVGProps } from "react";
import { cn } from "../lib/cn";
import { ICON_BODIES } from "./icons.gen";

/* ------------------------------------------------------------------ *
 *  Icon — every glyph in the app, drawn from one pack.
 *
 *  The artwork is "Lets Icons" by Leonid Tsvetkov (CC BY 4.0): the exact
 *  set the Figma community file "Free Icon Pack 1800+ icons" ships, taken
 *  from Iconify's mirror of it. tools/icons/build.mjs holds the table that
 *  maps the site's names onto the pack's and writes icons.gen.ts; the
 *  reasoning for the handful of substitutions is in docs/icons.md.
 *
 *  Nothing here draws geometry: call sites keep using the same names they
 *  always did, and the bodies inherit the colour, the weight and the size
 *  from this element — so a pack icon still scales with the stage and
 *  still mirrors in RTL exactly like the hand-drawn set it replaced.
 * ------------------------------------------------------------------ */

export type IconName = keyof typeof ICON_BODIES;

type Props = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number | string;
  strokeWidth?: number;
};

/**
 * Glyphs that only ever point "up and away" — there is no logical
 * counterpart to swap them for, so in a right-to-left interface they are
 * mirrored whole (`dir-flip`, src/index.css). Arrows that mean back / next
 * are NOT here: those are picked per direction with `backIcon` /
 * `forwardIcon`, because in RTL "back" is the arrow that points right.
 */
const MIRRORED_IN_RTL: IconName[] = ["arrowUpRight", "send"];

/** `<mask id>` is global to the document, so two icons on one screen would
 *  fight over it: each render gets its own copy of the id. */
const scopeIds = (body: string, scope: string) =>
  body
    .replace(/id="(SVG[^"]*)"/g, `id="$1-${scope}"`)
    .replace(/url\(#(SVG[^)]*)\)/g, `url(#$1-${scope})`);

export function Icon({ name, size = 18, strokeWidth = 1.6, className, ...rest }: Props) {
  const scope = useId().replace(/[^a-zA-Z0-9]/g, "");
  const body = useMemo(() => scopeIds(ICON_BODIES[name], scope), [name, scope]);

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(MIRRORED_IN_RTL.includes(name) && "dir-flip", className)}
      dangerouslySetInnerHTML={{ __html: body }}
      {...rest}
    />
  );
}
