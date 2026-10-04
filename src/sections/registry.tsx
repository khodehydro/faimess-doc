import type { ComponentType } from "react";
import { TopBar } from "./TopBar";
import { HeroBanner } from "./HeroBanner";
import { ScheduleSection } from "./ScheduleSection";
import { GreetingSection } from "./GreetingSection";
import { MessagesSection } from "./MessagesSection";
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
 *  Note: the home feed composes its own sub-shelves — see src/sections/feed/.
 *  No other file needs to change.
 * ------------------------------------------------------------------ */

export type SectionParams = {
  topbar: undefined;
  hero: undefined;
  schedule: undefined;
  feed: undefined;
  greeting: undefined;
  messages: undefined;
  collection: { kind: LibraryKind };
};

export type SectionId = keyof SectionParams;

export const sections = {
  topbar: TopBar,
  hero: HeroBanner,
  schedule: ScheduleSection,
  feed: FeedSection,
  greeting: GreetingSection,
  messages: MessagesSection,
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
