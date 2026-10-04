import type { ComponentType } from "react";
import { BrandCard } from "./BrandCard";
import { NavCard } from "./NavCard";
import { AccountCard } from "./AccountCard";
import { HeroBanner } from "./HeroBanner";
import { ScheduleSection } from "./ScheduleSection";
import { GreetingSection } from "./GreetingSection";
import { MessagesSection } from "./MessagesSection";
import { PlayerSection } from "./PlayerSection";
import { CollectionSection, type LibraryKind } from "./CollectionSection";
import { FeedSection } from "./feed";

/* ------------------------------------------------------------------ *
 *  Section registry — the extension point of the app.
 *
 *  To add a section:
 *    1. drop a component file in src/sections/
 *    2. add one line to `params` and one to `sections` below
 *    3. place <SectionSlot id="…" /> wherever it belongs in a page
 *
 *  The home screen is made of five cards: brand / nav / account (top pills)
 *  and the left + right content cards.
 *
 *  Note: the home feed composes its own sub-shelves — see src/sections/feed/.
 *  No other file needs to change.
 * ------------------------------------------------------------------ */

export type SectionParams = {
  brand: undefined;
  nav: undefined;
  account: undefined;
  hero: undefined;
  schedule: undefined;
  feed: undefined;
  greeting: undefined;
  messages: undefined;
  player: { expanded: boolean; onToggleExpand: () => void };
  collection: { kind: LibraryKind };
};

export type SectionId = keyof SectionParams;

export const sections = {
  brand: BrandCard,
  nav: NavCard,
  account: AccountCard,
  hero: HeroBanner,
  schedule: ScheduleSection,
  feed: FeedSection,
  greeting: GreetingSection,
  messages: MessagesSection,
  player: PlayerSection,
  collection: CollectionSection,
} as const;

type AnySection = ComponentType<{ params: SectionParams[SectionId] }>;

export function SectionSlot<K extends SectionId>({
  id,
  params,
}: {
  id: K;
  params: SectionParams[K];
}) {
  const Component = sections[id] as unknown as ComponentType<{ params: SectionParams[K] }>;
  return <Component params={params} />;
}
